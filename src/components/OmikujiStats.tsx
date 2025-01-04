import type { Stats } from "@/lib/firebase/db";
import { OmikujiChart } from "./OmikujiChart";

type Props = {
  stats: Stats;
};

export function OmikujiStats({ stats }: Props) {
  const recentMonths = Object.entries(stats.byMonth)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <OmikujiChart data={stats.byResult} total={stats.total} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">月別の記録数</h3>
          <div className="space-y-2">
            {recentMonths.map(([month, count]) => (
              <div key={month} className="flex justify-between items-center">
                <a
                  href={`/record/month/${month}`}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {month}
                </a>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {count}回
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">サマリー</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                総記録数
              </p>
              <p className="text-2xl font-bold">{stats.total}回</p>
            </div>
            {stats.latestStreak.count > 1 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  最近の連続記録
                </p>
                <p className="text-2xl font-bold">
                  {stats.latestStreak.result} {stats.latestStreak.count}回連続
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
