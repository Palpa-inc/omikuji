type Props = {
  onFilterChange: (filters: {
    result?: string;
    shrine?: string;
    keyword?: string;
  }) => void;
};

export function OmikujiFilter({ onFilterChange }: Props) {
  const resultOptions = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">検索・絞り込み</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">結果</label>
          <select
            onChange={(e) =>
              onFilterChange({ result: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
          >
            <option value="">すべて</option>
            {resultOptions.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">神社・お寺</label>
          <input
            type="text"
            onChange={(e) =>
              onFilterChange({ shrine: e.target.value || undefined })
            }
            placeholder="神社名で検索"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">キーワード</label>
          <input
            type="text"
            onChange={(e) =>
              onFilterChange({ keyword: e.target.value || undefined })
            }
            placeholder="メモ内容で検索"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
