import React, { useState, useEffect } from 'react';
import fetchGithubIssues, { type RepoData } from '@/lib/github-issues';
import { IssueChart, type ChartType } from './Chart';
import ButtonToggle from './ButtonToggle';

type ReposArray = string[];

type Parameters = {
  repos: ReposArray;
};

const GitHubIssuesDashboard: React.FC<Parameters> = ({ repos }) => {
  const [data, setData] = useState<RepoData[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('issues');

  const monthsPeriod = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const validRepos = await fetchGithubIssues(repos, monthsPeriod);
        setData(validRepos);
      } catch (err) {
        setError((err as Error).message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (repos.length) {
      setReady(true);
      fetchData();
    }
  }, [repos]);

  if (!ready) {
    return (<></>);
  }
  if (loading || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        { error ? (
          <div className="text-center">
            <div className="text-xl text-red-600 mb-2">Error loading data</div>
            <div className="text-gray-600">{error}</div>
          </div>
        ) : (
          <div className="text-xl">Loading GitHub data...</div>
        ) }
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6">
        <div className="mb-4 flex gap-2">
          <ButtonToggle onClick={() => setChartType('issues')} active={chartType === 'issues'} >All Issues</ButtonToggle>
          <ButtonToggle onClick={() => setChartType('bugs')} active={chartType === 'bugs'} >Bug Reports Only</ButtonToggle>
        </div>

        <IssueChart
          data={data} 
          type={chartType}
          months={monthsPeriod}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map(repo => (
            <div key={`${repo.owner}/${repo.repo}`} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">{repo.owner}/{repo.repo}</h3>
              <div className="text-sm mb-3">
                Total Issues ({monthsPeriod} months):
                <span className="font-medium">{repo.totalIssues}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-medium">Recent weeks:</div>
                {repo.timeline.slice(-monthsPeriod).map(week => (
                  <div key={week.week} className="flex justify-between">
                    <span>{week.week}:</span>
                    <span>{week.totalIssues} issues ({week.bugReports} bugs)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubIssuesDashboard;
