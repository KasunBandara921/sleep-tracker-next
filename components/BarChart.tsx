'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RecordItem {
  id: string;
  text: string;
  amount: number;
  userId: string;
  createdAt: Date;
  date: string;
}

interface BarChartProps {
  records: RecordItem[];
}

export default function BarChart({ records }: BarChartProps) {
  // The records are ordered by date desc in the database query.
  // For standard left-to-right timeline visualization, we reverse them.
  const sortedRecords = [...records].reverse();

  const labels = sortedRecords.map((r) => {
    const d = new Date(r.date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Sleep Duration (Hours)',
        data: sortedRecords.map((r) => r.amount),
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // violet-500 with opacity
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(236, 72, 153, 0.8)', // pink-500 with opacity
        hoverBorderColor: 'rgb(236, 72, 153)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151', // gray-700
          font: {
            family: 'system-ui, sans-serif',
            size: 13,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937', // gray-800
        titleColor: '#f9fafb',
        bodyColor: '#f3f4f6',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const record = sortedRecords[index];
            return record.text ? `Note: ${record.text}` : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4b5563', // gray-600
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb', // gray-200
        },
        ticks: {
          color: '#4b5563', // gray-600
          callback: (value) => `${value}h`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 md:h-96 relative">
      <Bar data={data} options={options} />
    </div>
  );
}
