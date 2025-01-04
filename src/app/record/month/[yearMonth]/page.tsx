import { MonthlyOmikujiContent } from "@/components/MonthlyOmikujiContent";

// Server Component として定義
export default async function MonthlyOmikujiPage({
  params,
}: {
  params: Promise<{ yearMonth: string }>;
}) {
  const { yearMonth } = await params;
  return <MonthlyOmikujiContent yearMonth={yearMonth} />;
}
