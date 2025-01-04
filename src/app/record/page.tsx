"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { saveOmikuji, checkAndUpdateUsageLimit } from "@/lib/firebase/db";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/motion/PageTransition";
import { FormFields } from "@/components/record/FormFields";

const omikujiSchema = z.object({
  date: z.string(),
  result: z.enum(["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"]),
  shrine: z.string().optional(),
  content: z.record(z.string()),
  memo: z.string().optional(),
});

type FormValues = z.infer<typeof omikujiSchema>;

export default function RecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [openSections, setOpenSections] = useState({
    basic: true,
    content: true,
    memo: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(omikujiSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      result: "小吉",
      content: {},
      shrine: "",
      memo: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      await saveOmikuji({
        ...data,
        userId: user.uid,
        shrine: data.shrine || "",
        memo: data.memo || "",
      });
      router.push("/");
    } catch (error) {
      setError(
        "おみくじの保存中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error saving omikuji:", error);
    }
  };

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // 高解像度で処理
          canvas.width = Math.max(image.width, 2048);
          canvas.height = Math.max(image.height, 2048);

          // 画質設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 画像描画
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // コントラスト調整
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
              let color = data[i + j];
              color = color > 200 ? 255 : color < 50 ? 0 : color;
              data[i + j] = color;
            }
          }
          ctx.putImageData(imageData, 0, 0);

          resolve(canvas.toDataURL("image/jpeg", 1.0));
        };
        image.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageProcess = async (file: File) => {
    if (!user) {
      setError("認証エラーが発生しました。ページを再読み込みしてください。");
      return;
    }

    setIsProcessing(true);
    try {
      // 使用制限をチェック
      const canProceed = await checkAndUpdateUsageLimit(user.uid);
      if (!canProceed) {
        setError("本日の画像読み取り回数の上限に達しました");
        return;
      }

      const processedImage = await processImage(file);
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: processedImage,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const rawResult = await response.json();
      console.log("Raw API Response:", rawResult);

      // 文字列として返ってきた場合はパースする
      const result =
        typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
      console.log("Parsed result:", result);

      form.setValue("content", {});
      console.log("Content before processing:", form.getValues("content"));

      Object.entries(result).forEach(([key, value]) => {
        console.log(
          `Processing key: ${key}, value: ${value}, type: ${typeof value}`
        );
        if (key === "result") {
          if (
            ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"].includes(
              value as string
            )
          ) {
            form.setValue(
              "result",
              value as "大吉" | "中吉" | "小吉" | "吉" | "末吉" | "凶" | "大凶"
            );
            console.log("Set result value:", value);
          }
        } else {
          form.setValue(`content.${key}`, value as string);
          console.log(`Set content value for ${key}:`, value);
        }
      });

      console.log("Final form values:", form.getValues());
    } catch (error) {
      console.error("Error details:", error);
      setError("画像の処理中にエラーが発生しました");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">おみくじを記録</h1>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ← 戻る
            </Link>
          </div>

          {error && (
            <div className="mb-6">
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Collapsible
                open={openSections.basic}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, basic: open }))
                }
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>基本情報</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          {openSections.basic ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent
                    className={cn(
                      "transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden"
                    )}
                  >
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>日付</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="result"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>おみくじの結果</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="結果を選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "大吉",
                                  "中吉",
                                  "小吉",
                                  "吉",
                                  "末吉",
                                  "凶",
                                  "大凶",
                                ].map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shrine"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>神社・お寺 (任意)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="神社やお寺の名前"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible
                open={openSections.content}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, content: open }))
                }
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>おみくじの内容</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          {openSections.content ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent
                    className={cn(
                      "transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden"
                    )}
                  >
                    <CardContent className="space-y-6">
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg transition-colors",
                          isDragging
                            ? "border-violet-500 bg-violet-50"
                            : "bg-primary/5 hover:bg-primary/10"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith("image/")) {
                            await handleImageProcess(file);
                          }
                        }}
                      >
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-4 p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-700 border-t-transparent" />
                            <p className="text-sm text-muted-foreground">
                              おみくじの内容を読み取っています...
                            </p>
                          </div>
                        ) : (
                          <div className="p-8">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="camera-input"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageProcess(file);
                                }
                              }}
                            />
                            <label
                              htmlFor="camera-input"
                              className="flex flex-col items-center gap-3 cursor-pointer"
                            >
                              <div className="p-4 rounded-full bg-violet-100 text-violet-700">
                                <Camera className="h-8 w-8" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium">写真を読みこむ</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  または画像をドラッグ&ドロップ
                                </p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>

                      <FormFields
                        fields={Object.entries(form.getValues("content")).map(
                          ([key]) => ({
                            key,
                            value: form.getValues(`content.${key}`),
                          })
                        )}
                        form={form}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible
                open={openSections.memo}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, memo: open }))
                }
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>メモ</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          {openSections.memo ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent
                    className={cn(
                      "transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden"
                    )}
                  >
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="memo"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="おみくじの内容や感想を記録"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "保存中..." : "記録する"}
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/">キャンセル</Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PageTransition>
    </div>
  );
}
