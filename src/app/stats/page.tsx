"use client";

import { useAuth } from "@/lib/firebase/auth";
import { getOmikujiStats } from "@/lib/firebase/db";
import { OmikujiStats } from "@/components/OmikujiStats";
import { Loading } from "@/components/Loading";
import { Alert } from "@/components/Alert";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import type { Stats } from "@/lib/firebase/db";
export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const statsData = await getOmikujiStats(user.uid);
        setStats(statsData);
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
        <h1 className="text-2xl font-bold mb-8">統計情報</h1>
        <div className="max-w-2xl mx-auto">
          {error ? (
            <Alert type="error" message={error} onClose={() => setError("")} />
          ) : stats ? (
            <OmikujiStats stats={stats} />
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
