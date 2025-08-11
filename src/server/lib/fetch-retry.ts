// Fetch data with retry for rate-limiting
export const fetchWithRetry = async (
  url: string,
  additionalHeaders?: Record<string, string>
): Promise<Response | undefined> => {
  const headers: Record<string, string> = {
    'User-Agent': 'GitHub-Issue-Tracker',
    'Accept': 'application/vnd.github.v3+json',
    ...additionalHeaders,
  };

  let done = false;
  let tries = 0;
  let response: Response | undefined;

  while (!done && tries <= 3) {
    console.log(`Fetching ${url} (attempt ${tries + 1})`);
    response = await fetch(url, { headers });
    tries++;

    if (response.ok) {
      console.log(`Successfully fetched ${url}`);
      done = true;
    } else {
      if (response.status === 403 && response.statusText === 'rate limit exceeded') {
        console.warn(`Rate limit exceeded for ${url}. Retrying in ${1000 * tries}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * tries));
      } else {
        // if error: stop trying
        done = true
        console.error(`Failed to fetch issues after ${tries} attempts for URL ${url}`);
      }
    }
  }
  return response;
}
