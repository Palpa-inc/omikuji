"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { getYearlyGoals, type YearlyGoal } from "@/lib/firebase/db";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";

export default function GoalsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGoals() {
      if (!user) return;

      try {
        const data = await getYearlyGoals(user.uid);
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setError("抱負の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchGoals();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">年別の抱負</h1>
          <div className="flex gap-4 items-center">
            <Link
              href="/goals"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              今年の抱負を編集
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError("")} />
          </div>
        )}

        {goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{goal.year}年の抱負</h2>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(goal.createdAt?.toDate()).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {goal.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            まだ抱負が記録されていません
          </p>
        )}
      </main>
    </div>
  );
}
