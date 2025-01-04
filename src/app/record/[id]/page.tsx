"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  getOmikujiById,
  deleteOmikuji,
  updateOmikuji,
} from "@/lib/firebase/db";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { OMIKUJI_ITEMS } from "@/lib/constants";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function OmikujiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [omikuji, setOmikuji] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<string>("");
  const [editedMemo, setEditedMemo] = useState("");
  const [editedShrine, setEditedShrine] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    content: false,
    memo: false,
  });

  useEffect(() => {
    async function fetchOmikuji() {
      if (!user) return;

      try {
        const data = await getOmikujiById(id);
        if (!data || data.userId !== user.uid) {
          router.push("/");
          return;
        }
        setOmikuji(data);
        setEditedResult(data.result);
        setEditedMemo(data.memo);
        setEditedShrine(data.shrine);
        setEditedDate(data.date);
      } catch (error) {
        console.error("Error fetching omikuji:", error);
        setError("おみくじの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOmikuji();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, id, router]);

  const handleDelete = async () => {
    if (!window.confirm("このおみくじの記録を削除しますか？")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOmikuji(id);
      router.push("/");
    } catch (error) {
      console.error("Error deleting omikuji:", error);
      setError("削除に失敗しました");
      setIsDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateOmikuji(id, {
        result: editedResult as
          | "大吉"
          | "中吉"
          | "小吉"
          | "吉"
          | "末吉"
          | "凶"
          | "大凶",
        memo: editedMemo,
        shrine: editedShrine,
        date: editedDate,
        content: omikuji.content,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating omikuji:", error);
      setError("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!omikuji) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">おみくじの詳細</h1>
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← 戻る
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError("")} />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">日付</label>
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  おみくじの結果
                </label>
                <select
                  value={editedResult}
                  onChange={(e) => setEditedResult(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
                  required
                >
                  {["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"].map(
                    (value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  神社・お寺 (任意)
                </label>
                <input
                  type="text"
                  value={editedShrine}
                  onChange={(e) => setEditedShrine(e.target.value)}
                  placeholder="神社やお寺の名前"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  メモ (任意)
                </label>
                <textarea
                  value={editedMemo}
                  onChange={(e) => setEditedMemo(e.target.value)}
                  placeholder="おみくじの内容や感想を記録"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 min-h-[100px] bg-transparent"
                />
              </div>

              {omikuji.content &&
                Object.entries(omikuji.content).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                      おみくじの内容
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(omikuji.content).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                        >
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {key}
                          </dt>
                          <dd className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                            {value as string}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "保存中..." : "保存する"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <time className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {omikuji.date.split("-")[0]}
                        </span>
                        年 {omikuji.date.split("-")[1]}月
                        {omikuji.date.split("-")[2]}日
                      </time>
                      <div className="flex items-center gap-4 mt-1">
                        <h2 className="text-2xl font-bold">{omikuji.result}</h2>
                        {omikuji.shrine && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                            <Building2 className="h-4 w-4" />
                            <span>{omikuji.shrine}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">編集する</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">削除する</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {omikuji.content &&
                  Object.entries(omikuji.content).length > 0 && (
                    <Collapsible
                      open={openSections.content}
                      onOpenChange={(open) =>
                        setOpenSections((prev) => ({ ...prev, content: open }))
                      }
                    >
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            おみくじの内容
                          </h3>
                          <CollapsibleTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              {openSections.content ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent
                          className={cn(
                            "transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden"
                          )}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {Object.entries(omikuji.content).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                                >
                                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {key}
                                  </dt>
                                  <dd className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                    {value as string}
                                  </dd>
                                </div>
                              )
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )}

                {omikuji.memo && (
                  <Collapsible
                    open={openSections.memo}
                    onOpenChange={(open) =>
                      setOpenSections((prev) => ({ ...prev, memo: open }))
                    }
                  >
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          メモ
                        </h3>
                        <CollapsibleTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            {openSections.memo ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent
                        className={cn(
                          "transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden"
                        )}
                      >
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                          {omikuji.memo}
                        </p>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
