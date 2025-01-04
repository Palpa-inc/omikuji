import { OmikujiRecord } from "@/lib/firebase/db";

type Props = {
  items: (OmikujiRecord & { id: string })[];
};

export function OmikujiList({ items }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={`/record/${item.id}`}
          className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-600 dark:hover:border-indigo-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {item.date}
              </time>
              <h3 className="text-lg font-medium mt-1">{item.result}</h3>
            </div>
            {item.shrine && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {item.shrine}
              </div>
            )}
          </div>
          {item.memo && (
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap line-clamp-2">
              {item.memo}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
