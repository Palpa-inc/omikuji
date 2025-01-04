"use client";

import { useAuth } from "@/lib/firebase/auth";
import { getOmikujiList } from "@/lib/firebase/db";
import { OmikujiList } from "@/components/OmikujiList";
import { Loading } from "@/components/Loading";
import { Alert } from "@/components/Alert";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [omikujiList, setOmikujiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const list = await getOmikujiList(user.uid, 50); // より多くの履歴を表示
        setOmikujiList(list);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageTransition className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">おみくじの履歴</h1>
        <div className="max-w-2xl mx-auto">
          {error ? (
            <Alert type="error" message={error} onClose={() => setError("")} />
          ) : omikujiList.length > 0 ? (
            <OmikujiList items={omikujiList} />
          ) : (
            <p className="text-center text-gray-500">
              まだおみくじの記録がありません
            </p>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
