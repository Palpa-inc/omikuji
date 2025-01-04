import { YearlyGoal } from "@/lib/firebase/db";
import { Check, Lock, Globe, Pencil } from "lucide-react";

export function YearlyGoalCard({
  goal,
  isPublic = false,
}: {
  goal: YearlyGoal;
  isPublic?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {!isPublic ? (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-violet-950 dark:text-violet-50">
            今年の抱負
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-violet-600/90 dark:text-violet-300">
              {goal.isPublic ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span className="font-medium">
                {goal.isPublic ? "公開" : "非公開"}
              </span>
            </div>
            <a
              href="/goals"
              className="text-violet-600/75 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-200 transition-colors duration-200"
            >
              <Pencil className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}
      <div className="space-y-4">
        {goal.content.split("\n").map(
          (item, index) =>
            item.trim() && (
              <div key={index} className="flex items-start gap-3 group">
                <div className="mt-1 flex-shrink-0">
                  <div className="h-4 w-4 rounded-full bg-violet-100 dark:bg-violet-900/75 border border-violet-400 dark:border-violet-600 flex items-center justify-center group-hover:border-violet-500 dark:group-hover:border-violet-400 transition-colors duration-200">
                    <Check className="h-3 w-3 text-violet-500 dark:text-violet-400" />
                  </div>
                </div>
                <p className="text-sm text-violet-900/90 dark:text-violet-100/90 leading-relaxed">
                  {item}
                </p>
              </div>
            )
        )}
      </div>
    </div>
  );
}
