"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  saveYearlyGoal,
  getCurrentYearGoal,
  type YearlyGoal,
} from "@/lib/firebase/db";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";

type GoalItem = {
  id: string;
  text: string;
};

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [currentGoal, setCurrentGoal] = useState<YearlyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const [isPublic, setIsPublic] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>([{ id: "1", text: "" }]);

  useEffect(() => {
    async function fetchCurrentGoal() {
      if (!user) return;

      try {
        const goal = await getCurrentYearGoal(user.uid);
        if (goal) {
          setCurrentGoal(goal);
          const goalItems = goal.content
            .split("\n")
            .filter((item) => item.trim())
            .map((text, index) => ({
              id: String(index + 1),
              text: text.trim(),
            }));
          setGoals(goalItems.length > 0 ? goalItems : [{ id: "1", text: "" }]);
          setIsPublic(goal.isPublic);
        } else {
          setIsPublic(true);
        }
      } catch (error) {
        console.error("Error fetching current goal:", error);
        setError("今年の抱負の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchCurrentGoal();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!user) {
      setError("認証エラーが発生しました。ページを再読み込みしてください。");
      setIsSubmitting(false);
      return;
    }

    try {
      await saveYearlyGoal({
        userId: user.uid,
        year: currentYear,
        content: goals.map((goal) => goal.text).join("\n"),
        isPublic,
      });
      router.push("/");
    } catch (error) {
      setError("抱負の保存中にエラーが発生しました。もう一度お試しください。");
      console.error("Error saving goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    setGoals([...goals, { id: crypto.randomUUID(), text: "" }]);
  };

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setGoals(goals.filter((goal) => goal.id !== id));
    }
  };

  const updateGoal = (id: string, text: string) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, text } : goal)));
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-center">
          {currentYear}年の抱負
        </h1>
      </header>

      <main className="max-w-md mx-auto">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError("")} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                今年の抱負を書いてください
              </label>
              <button
                type="button"
                onClick={addGoal}
                className="text-sm text-violet-600 hover:text-violet-700"
              >
                + 追加
              </button>
            </div>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <div key={goal.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={goal.text}
                      onChange={(e) => updateGoal(goal.id, e.target.value)}
                      placeholder={`抱負 ${index + 1}`}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
                      required
                    />
                  </div>
                  {goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <span className="sr-only">削除</span>×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700"
              />
              <span className="text-sm">この目標を公開する</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              公開された目標は他のユーザーにも表示されます
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 px-4 transition-colors"
            >
              {isSubmitting
                ? "保存中..."
                : currentGoal
                ? "更新する"
                : "記録する"}
            </button>
            <a
              href="/"
              className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-lg py-2 px-4 text-center transition-colors"
            >
              キャンセル
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
