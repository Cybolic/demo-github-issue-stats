import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { RepoData } from '@/lib/github-issues';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export type ChartType = 'issues' | 'bugs';

type Parameters = {
  data: RepoData[];
  type: ChartType;
  months: number;
};
export const IssueChart: React.FC<Parameters> = ({ data, type, months }) => {
  const colors = [
    { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' }
  ];

  const isBugs = type === 'bugs';
  const chartData: ChartData<'line'> = {
    labels: data[0]?.timeline.map(week => week.week) || [],
    datasets: data.map((repo, index) => ({
      backgroundColor: colors[index % colors.length].bg,
      borderColor: colors[index % colors.length].border,
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      label: `${repo.owner}/${repo.repo}`,
      data: isBugs ?
        repo.timeline.map(week => week.bugReports)
      : repo.timeline.map(week => week.totalIssues),
    }))
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `GitHub Issues Timeline - Last ${months} Months${ isBugs ? ' (Bugs Only)' : '' }`,
        font: { size: 18 }
      },
    },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <Line 
      data={chartData} 
      options={options} 
    />
  );
};


