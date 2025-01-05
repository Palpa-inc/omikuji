"use client";
import { useAuth } from "@/lib/firebase/auth";
import Link from "next/link";
import {
  getCurrentYearGoal,
  getPublicYearlyGoals,
  YearlyGoal,
} from "@/lib/firebase/db";
import { YearlyGoalCard } from "@/components/YearlyGoalCard";
import { Loading } from "@/components/Loading";
import { useEffect, useState } from "react";
import { Camera, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PublicGoalsHighlight } from "@/components/PublicGoalsHighlight";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/motion/PageTransition";
import { Squircle } from "@squircle-js/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const [yearlyGoal, setYearlyGoal] = useState<YearlyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicGoals, setPublicGoals] = useState<YearlyGoal[]>([]);
  const currentYear = new Date().getFullYear();

  // 公開目標の取得（認証不要）
  useEffect(() => {
    async function fetchPublicData() {
      try {
        const publicGoalsData = await getPublicYearlyGoals(currentYear, 3);
        setPublicGoals(publicGoalsData);
      } catch (error) {
        console.error("Error fetching public data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, [currentYear]);

  // ユーザーの目標取得（認証必要）
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        return;
      }

      try {
        const goal = await getCurrentYearGoal(user.uid);
        setYearlyGoal(goal);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [user]);

  const handleAuthRequired = async () => {
    if (!user) {
      await signInAnonymously();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <Header />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading />
        </div>
        <div className="opacity-50">
          <PageContent
            yearlyGoal={null}
            publicGoals={[]}
            currentYear={currentYear}
            handleAuthRequired={handleAuthRequired}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
      <PageContent
        yearlyGoal={yearlyGoal}
        publicGoals={publicGoals}
        currentYear={currentYear}
        handleAuthRequired={handleAuthRequired}
      />
    </div>
  );
}

function PageContent({
  yearlyGoal,
  publicGoals,
  currentYear,
  handleAuthRequired,
}: {
  yearlyGoal: YearlyGoal | null;
  publicGoals: YearlyGoal[];
  currentYear: number;
  handleAuthRequired: () => Promise<void>;
}) {
  return (
    <>
      <PageTransition className="container mx-auto px-4 py-8">
        <header className="text-center mb-4 relative">
          <h1 className="text-3xl font-bold mb-2">おみログ</h1>
          <p className="text-gray-600 dark:text-gray-400">
            おみくじ引いたらおみログに。
            <br />
            {currentYear}年の運勢を記録しておこう
          </p>
        </header>

        <main className="max-w-md mx-auto space-y-6">
          {yearlyGoal && <YearlyGoalCard goal={yearlyGoal} />}

          <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <Squircle
                  asChild
                  cornerRadius={16}
                  cornerSmoothing={1}
                  className="bg-violet-600 hover:bg-violet-700 text-lg text-white h-auto py-4"
                >
                  <Button onClick={handleAuthRequired} asChild>
                    <Link href="/record">
                      <Camera className="h-5 w-5" />
                      <span>おみくじをアップロード</span>
                    </Link>
                  </Button>
                </Squircle>
                <div className="flex items-start gap-3 px-1">
                  <div className="p-1.5 rounded-full bg-violet-100 text-violet-600">
                    <Camera className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    写真を撮るだけで簡単記録！
                    おみくじの内容を自動で読み取って入力を補完します
                  </p>
                </div>
              </div>
            </Card>
            {!yearlyGoal && (
              <Card className="p-4">
                <div className="flex flex-col gap-4">
                  <Squircle
                    asChild
                    cornerRadius={16}
                    cornerSmoothing={1}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg h-auto py-4"
                  >
                    <Link
                      href="/goals"
                      className="flex items-center justify-center gap-2 w-full"
                    >
                      <ListTodo className="h-5 w-5" />
                      <span>今年の抱負を書く</span>
                    </Link>
                  </Squircle>
                  <div className="flex items-start gap-3 px-1">
                    <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      おみくじの運勢と一緒に今年の目標を立ててみよう
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {publicGoals.length > 0 && <PublicGoalsHighlight />}
        </main>
      </PageTransition>

      <footer className="py-4 text-center text-sm text-gray-500 relative">
        <p>© 2025 おみログ</p>
      </footer>
    </>
  );
}
