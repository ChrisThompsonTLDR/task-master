import React, { useState, useEffect, useMemo } from 'react';
import {
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { BarChart3, Target, Brain } from 'lucide-react';
import { TaskCard } from '../components/TaskCard'; // Import TaskCard
import { getComplexityReport } from '../services/taskService';

interface ComplexityAnalysis {
  taskId: number;
  taskTitle: string;
  complexityScore: number;
  recommendedSubtasks: number;
  expansionPrompt: string;
  reasoning: string;
}

interface ComplexityReport {
  meta: {
    generatedAt: string;
    tasksAnalyzed: number;
    totalTasks: number;
    analysisCount: number;
    thresholdScore: number;
    projectName: string;
    usedResearch: boolean;
  };
  complexityAnalysis: ComplexityAnalysis[];
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}) => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
  };

  const TrendIcon = trend === 'up' ? ArrowTrendingUpIcon : trend === 'down' ? ArrowTrendingDownIcon : null;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {TrendIcon && (
          <TrendIcon className={`h-5 w-5 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
        )}
      </div>
    </div>
  );
};

const ComplexityDistributionChart = ({ data }: { data: ComplexityAnalysis[] }) => {
  const distribution = useMemo(() => {
    const buckets = { low: 0, medium: 0, high: 0, critical: 0 };
    data.forEach(item => {
      if (item.complexityScore <= 3) buckets.low++;
      else if (item.complexityScore <= 6) buckets.medium++;
      else if (item.complexityScore <= 8) buckets.high++;
      else buckets.critical++;
    });
    return buckets;
  }, [data]);

  const total = data.length;
  const maxValue = Math.max(...Object.values(distribution));

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Complexity Distribution</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(distribution).map(([level, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;

          const colors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
          };

          return (
            <div key={level} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                  {level} (1-{level === 'low' ? '3' : level === 'medium' ? '6' : level === 'high' ? '8' : '10'})
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {count} tasks ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${colors[level as keyof typeof colors]} transition-all duration-300`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopComplexTasks = ({ data }: { data: ComplexityAnalysis[] }) => {
  const topTasks = useMemo(() =>
    [...data]
      .sort((a, b) => b.complexityScore - a.complexityScore)
      .slice(0, 10)
  , [data]);

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <ExclamationTriangleIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Most Complex Tasks</h3>
      </div>

      <div className="space-y-3">
        {topTasks.map((task) => (
          <TaskCard
            key={task.taskId}
            task={{
              id: task.taskId,
              title: task.taskTitle,
              description: task.reasoning, // Use reasoning as description for this context
              priority: task.complexityScore >= 8 ? 'high' : task.complexityScore >= 6 ? 'medium' : 'low',
              status: 'pending', // Default status for display in this context
              dependencies: []
            }}
            complexity={task}
            showDescription={true} // Show reasoning as description
            showStatus={false} // Status might not be relevant here
            showPriority={false} // Priority is derived from complexity, so hide default
            showRecommendedSubtasks={true}
            className="!p-3 !rounded-lg !bg-zinc-50 dark:!bg-zinc-900/50 hover:!bg-zinc-100 dark:hover:!bg-zinc-900/70"
          />
        ))}
      </div>
    </div>
  );
};

const RecommendedSubtasksChart = ({ data }: { data: ComplexityAnalysis[] }) => {
  const subtaskDistribution = useMemo(() => {
    const distribution: { [key: number]: number } = {};
    data.forEach(item => {
      distribution[item.recommendedSubtasks] = (distribution[item.recommendedSubtasks] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([subtasks, count]) => ({ subtasks: parseInt(subtasks), count }))
      .sort((a, b) => a.subtasks - b.subtasks);
  }, [data]);

  const maxCount = Math.max(...subtaskDistribution.map(d => d.count));

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recommended Subtasks Distribution</h3>
      </div>

      <div className="space-y-3">
        {subtaskDistribution.map(({ subtasks, count }) => {
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={subtasks} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {subtasks} subtasks
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {count} tasks
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const [report, setReport] = useState<ComplexityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const result = await getComplexityReport({});
        setReport(result);
        setError(null);
      } catch (e) {
        setError('Failed to load complexity report.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">Error Loading Report</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'Unable to load the complexity report data.'}
          </p>
        </div>
      </div>
    );
  }

  const { meta, complexityAnalysis } = report;

  const avgComplexity = complexityAnalysis.length > 0
    ? complexityAnalysis.reduce((sum, task) => sum + task.complexityScore, 0) / complexityAnalysis.length
    : 0;

  const avgSubtasks = complexityAnalysis.length > 0
    ? complexityAnalysis.reduce((sum, task) => sum + task.recommendedSubtasks, 0) / complexityAnalysis.length
    : 0;

  const highComplexityTasks = complexityAnalysis.filter(task => task.complexityScore >= meta.thresholdScore).length;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <DocumentChartBarIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Task Complexity Report</h1>
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Comprehensive analysis of task complexity across {meta.projectName} project
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>Generated: {new Date(meta.generatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CpuChipIcon className="h-4 w-4" />
            <span>{meta.tasksAnalyzed} tasks analyzed</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={meta.totalTasks}
          subtitle={`${meta.tasksAnalyzed} analyzed`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Average Complexity"
          value={avgComplexity.toFixed(1)}
          subtitle="out of 10"
          icon={Brain}
          color="purple"
        />
        <StatCard
          title="High Complexity"
          value={highComplexityTasks}
          subtitle={`≥${meta.thresholdScore} complexity score`}
          icon={ExclamationTriangleIcon}
          color="red"
          trend={highComplexityTasks > meta.totalTasks * 0.3 ? 'up' : 'down'}
        />
        <StatCard
          title="Avg Subtasks"
          value={avgSubtasks.toFixed(1)}
          subtitle="recommended per task"
          icon={ClipboardDocumentListIcon}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ComplexityDistributionChart data={complexityAnalysis} />
        <RecommendedSubtasksChart data={complexityAnalysis} />
      </div>

      {/* Top Complex Tasks */}
      <TopComplexTasks data={complexityAnalysis} />

      {/* Report Metadata */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <InformationCircleIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Report Metadata</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Project Name</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{meta.projectName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Threshold Score</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">{meta.thresholdScore}/10</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Research Used</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">
              {meta.usedResearch ? 'Yes' : 'No'}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
