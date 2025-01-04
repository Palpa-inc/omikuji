"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  TooltipItem,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  data: Record<string, number>;
  total: number;
};

export function OmikujiChart({ data, total }: Props) {
  const resultOrder = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"];
  const sortedData = resultOrder.map((result) => data[result] || 0);

  const chartData = {
    labels: resultOrder,
    datasets: [
      {
        label: "件数",
        data: sortedData,
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const value = context.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value}件 (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">結果の分布</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
