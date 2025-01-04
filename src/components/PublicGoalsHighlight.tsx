import { YearlyGoal } from "@/lib/firebase/db";
import Link from "next/link";
import { YearlyGoalCard } from "@/components/YearlyGoalCard";

export function PublicGoalsHighlight({ goals }: { goals: YearlyGoal[] }) {
  if (goals.length === 0) return null;

  const shuffledGoals = [...goals].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">みんなの今年の抱負</h2>
        <Link
          href="/goals/public"
          className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          すべて見る →
        </Link>
      </div>
      <div className="space-y-4">
        {shuffledGoals.map((goal) => (
          <YearlyGoalCard key={goal.id} goal={goal} isPublic />
        ))}
      </div>
    </div>
  );
}
