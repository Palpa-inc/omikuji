import { OmikujiRecord } from "@/lib/firebase/db";

type Props = {
  yearMonth: string;
  items: (OmikujiRecord & { id: string })[];
};

export function OmikujiCalendar({ yearMonth, items }: Props) {
  const [year, month] = yearMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // 日付ごとのおみくじをマッピング
  const omikujiByDate = items.reduce((acc, item) => {
    const date = item.date.split("-")[2];
    acc[parseInt(date)] = item;
    return acc;
  }, {} as Record<number, OmikujiRecord & { id: string }>);

  // カレンダーの日付配列を生成
  const calendar = [];
  let week = [];

  // 月初めの空白を追加
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push(null);
  }

  // 日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // 最後の週の空白を追加
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendar.push(week);
  }

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={`
              p-2 text-center text-sm font-medium bg-gray-100 dark:bg-gray-800
              ${i === 0 ? "text-red-600 dark:text-red-400" : ""}
              ${i === 6 ? "text-blue-600 dark:text-blue-400" : ""}
            `}
          >
            {day}
          </div>
        ))}

        {calendar.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const omikuji = day ? omikujiByDate[day] : null;
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  p-2 bg-white dark:bg-gray-800 min-h-[80px]
                  ${!day ? "bg-gray-50 dark:bg-gray-900" : ""}
                  ${dayIndex === 0 ? "text-red-600 dark:text-red-400" : ""}
                  ${dayIndex === 6 ? "text-blue-600 dark:text-blue-400" : ""}
                `}
              >
                <div className="text-sm mb-1">{day}</div>
                {omikuji && (
                  <a
                    href={`/record/${omikuji.id}`}
                    className="block text-xs p-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    {omikuji.result}
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
