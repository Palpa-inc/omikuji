export function getAdjacentMonth(yearMonth: string, offset: number) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function formatYearMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
  });
}
