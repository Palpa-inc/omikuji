"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { getOmikujiByMonth } from "@/lib/firebase/db";
import { OmikujiList } from "@/components/OmikujiList";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { OmikujiCalendar } from "@/components/OmikujiCalendar";
import { getAdjacentMonth, formatYearMonth } from "@/lib/utils/date";
import { OmikujiFilter } from "@/components/OmikujiFilter";

export default function MonthlyOmikujiPage({
  params,
}: {
  params: { yearMonth: string };
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [omikujiList, setOmikujiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [filters, setFilters] = useState<{
    result?: string;
    shrine?: string;
    keyword?: string;
  }>({});

  const yearMonth = params.yearMonth;
  const prevMonth = getAdjacentMonth(yearMonth, -1);
  const nextMonth = getAdjacentMonth(yearMonth, 1);
  const monthName = formatYearMonth(yearMonth);

  useEffect(() => {
    async function fetchOmikuji() {
      if (!user) return;

      try {
        const list = await getOmikujiByMonth(user.uid, yearMonth);
        setOmikujiList(list);
      } catch (error) {
        console.error("Error fetching omikuji:", error);
        setError("おみくじの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOmikuji();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, yearMonth]);

  useEffect(() => {
    if (!omikujiList) return;

    let filtered = [...omikujiList];

    if (filters.result) {
      filtered = filtered.filter((item) => item.result === filters.result);
    }

    if (filters.shrine) {
      const shrine = filters.shrine.toLowerCase();
      filtered = filtered.filter((item) =>
        item.shrine?.toLowerCase().includes(shrine)
      );
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter((item) =>
        item.memo?.toLowerCase().includes(keyword)
      );
    }

    setFilteredList(filtered);
  }, [omikujiList, filters]);

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{monthName}のおみくじ</h1>
            <div className="flex items-center gap-2">
              <a
                href={`/record/month/${prevMonth}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="前月"
              >
                ←
              </a>
              <a
                href={`/record/month/${nextMonth}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="翌月"
              >
                →
              </a>
            </div>
          </div>
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← トップへ
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {error ? (
          <Alert type="error" message={error} onClose={() => setError("")} />
        ) : (
          <div className="space-y-8">
            <OmikujiCalendar yearMonth={yearMonth} items={filteredList} />
            <OmikujiFilter onFilterChange={setFilters} />
            {omikujiList.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">記録一覧</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredList.length}件 / {omikujiList.length}件
                  </p>
                </div>
                <OmikujiList items={filteredList} />
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                この月のおみくじ記録はありません
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
