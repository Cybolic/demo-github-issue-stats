type WeeklyIssueData = {
  week: string;
  totalIssues: number;
  bugReports: number;
  otherIssues: number;
  openIssues: number;
  closedIssues: number;
};
type ApiResponse = {
  success: boolean;
  data: RepoData[];
  timestamp: string;
  error?: string;
};
export type RepoData = {
  owner: string;
  repo: string;
  totalIssues: number;
  timeline: WeeklyIssueData[];
};

export default async function fetchGithubIssues(repos: string[], months?: number): Promise<RepoData[]> {
  try {
    const response = await fetch('/api/v1/github-issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repos, months })
    });
    const result: ApiResponse = await response.json();

    if (result.success) {
      const validRepos = result.data.filter((repo): repo is RepoData => 
        'timeline' in repo
      );
      return validRepos;
    } else {
      throw new Error(result.error || 'Failed to load data');
    }
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`, { cause: err });
  }
}
