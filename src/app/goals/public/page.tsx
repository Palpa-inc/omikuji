"use client";

import { useEffect, useState } from "react";
import { getPublicYearlyGoals } from "@/lib/firebase/db";
import { Loading } from "@/components/Loading";
import { Alert } from "@/components/Alert";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/motion/PageTransition";
import { YearlyGoalCard } from "@/components/YearlyGoalCard";
import { YearlyGoal } from "@/lib/firebase/db";

export default function PublicGoalsPage() {
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchData() {
      try {
        const goalsData = await getPublicYearlyGoals(currentYear, 50); // より多くのゴールを取得
        setGoals(goalsData);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentYear]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageTransition className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">みんなの今年の抱負</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          {error ? (
            <Alert type="error" message={error} onClose={() => setError("")} />
          ) : goals.length > 0 ? (
            goals.map((goal) => (
              <YearlyGoalCard key={goal.id} goal={goal} isPublic />
            ))
          ) : (
            <p className="text-center text-gray-500">
              まだ公開されている抱負がありません
            </p>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
