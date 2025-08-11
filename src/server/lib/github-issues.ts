import { generateWeeklyRanges } from './date-ranges.js';
import type { WeeklyRange } from './date-ranges.js';
import { fetchWithRetry } from './fetch-retry.js';

/*
  Possible improvements:

  - Use an access token to avoid rate limiting
  - Use GraphQL API for more efficient queries
  - Allow other string inputs like "owner/repo"
*/


const parseGitHubUrl = (url: string): { owner: string; repo: string; } | null => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

type GitHubIssue = {
  labels: Array<{ name: string }>;
  pull_request?: unknown;
  created_at: string;
  type?: {
    name: string;
  }
} & ({
    state: 'open';
    closed_at: null;
  } | {
    state: 'closed';
    closed_at: string;
});
type GitHubSearchResponse = {
  items: GitHubIssue[];
}
const fetchRepoIssues = async (owner: string, repo: string, monthPeriod: number): Promise<GitHubIssue[]> => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - monthPeriod);
  const sinceDate = threeMonthsAgo.toISOString().split('T')[0];

  try {
    let allIssues: GitHubIssue[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {

      const query = `repo:${owner}/${repo} is:issue (is:open OR closed:>=${sinceDate})`;
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100&page=${page}&advanced_search=true`;
      const response = await fetchWithRetry(url);
      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }

      const data = await response.json() as GitHubSearchResponse;

      if (data.items.length === 0) {
        hasMore = false;
      } else {
        allIssues = allIssues.concat(data.items);
        page++;
      }
    }

    console.log(`Fetched ${allIssues.length} issues for ${owner}/${repo}`);

    return allIssues;
  } catch (error) {
    // FIXME: It would be good to tell the client about this
    console.error(`Error fetching issues for ${owner}/${repo}:`, (error as Error).message);
    return [];
  }
};

// Try to distinguish bug reports from other issues
const regexNonBugLabels = /(enhancement|wishlist|task|question|feature|discussion|explanation|wontfix|nicetohave)/;
const filterBugIssue = (issue: GitHubIssue): boolean => (
  (
    issue.labels.some(label => regexNonBugLabels.test(label.name.toLowerCase())) === false
  ) && (
    issue.type == null ||
    regexNonBugLabels.test(issue.type.name.toLowerCase()) === false
  )
);


type WeeklyIssueData = {
  week: string;
  totalIssues: number;
  bugReports: number;
  otherIssues: number;
  openIssues: number;
  closedIssues: number;
}
const analyzeIssuesByTime = (issues: GitHubIssue[], weeklyRanges: WeeklyRange[]): WeeklyIssueData[] => {
  return weeklyRanges.map(range => {
    const weekIssues = issues.filter(issue => {
      // Keep issues that are still open by the end of this week
      if (issue.state === 'open') {
        const createdDate = new Date(issue.created_at).toISOString().split('T')[0];
        return createdDate <= range.end;
      // Keep issues that were closed during this week
      } else {
        const closedDate = new Date(issue.closed_at).toISOString().split('T')[0];
        return closedDate >= range.start && closedDate <= range.end;
      }
    });

    const bugIssues = weekIssues.filter(issue => filterBugIssue(issue));
    const openIssues = weekIssues.filter(issue => issue.state === 'open');
    const closedIssues = weekIssues.filter(issue => issue.state === 'closed');

    return {
      week: range.label,
      totalIssues: weekIssues.length,
      bugReports: bugIssues.length,
      otherIssues: weekIssues.length - bugIssues.length,
      openIssues: openIssues.length,
      closedIssues: closedIssues.length
    };
  });
};

type RepoAnalysis = {
  url: string;
  owner: string;
  repo: string;
  timeline: WeeklyIssueData[];
  totalIssues: number;
}

type RepoError = {
  url: string;
  error: string;
}
type AnalysisResult = RepoAnalysis | RepoError;
export const analyzeRepo = async (repoUrl: string, months: number = 5): Promise<AnalysisResult> => {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { url: repoUrl, error: 'Invalid GitHub URL' };
  }

  const issues = await fetchRepoIssues(parsed.owner, parsed.repo, months);
  const weeklyRanges = generateWeeklyRanges(months);
  const timelineData = analyzeIssuesByTime(issues, weeklyRanges);

  return {
    url: repoUrl,
    owner: parsed.owner,
    repo: parsed.repo,
    timeline: timelineData,
    totalIssues: issues.length
  };
};
