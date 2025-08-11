import { useState } from 'react'
import './App.css'
import GitHubIssuesDashboard from '@components/Dashboard.tsx';

function App() {
  const [liveReposValue, setLiveReposValue] = useState<string>([].join('\n'));
  const [reposValue, setReposValue] = useState<string[]>([]);

  const handleButtonClick = () => {
    const reposArray = liveReposValue
      .split('\n')
      .map(repo => repo.trim())
      .filter(repo => repo.match(/^https:\/\/github\.com\/[^/]+\/[^/]+$/))

    console.log('Parsed repositories:', reposArray);

    setReposValue(reposArray);
  };

  return (<>
    Write the URLs of the repositories you want to investigate, one per line:
    <textarea
      value={liveReposValue}
      onChange={(e) => setLiveReposValue(e.target.value)}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-900 leading-tight focus:outline-none focus:shadow-outline"
      rows={10}
      cols={80}
      placeholder="https://github.com/owner/repo..."
    />
    <button onClick={handleButtonClick}>
      Fetch Issue Stats
    </button>
    <GitHubIssuesDashboard repos={reposValue}/>
  </>)
}

export default App
