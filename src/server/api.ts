import fs from 'node:fs';
import express from 'express';
import type { Request, Response } from 'express';
import apiValidation from './api.validation.js';
import { analyzeRepo } from './lib/github-issues.js';

const router = express.Router();

/* Possible improvements:
  - Use SSE: For better client-side feedback, but we're keeping it simple for now with a single response.
  - Add better logging
*/

router.post('/github-issues', apiValidation, async (req: Request, res: Response) => {
  // For quick testing, use a static data file
  if (process.env.USE_DATA_FILE?.length) {
    return res.json({
      success: true,
      data: JSON.parse(fs.readFileSync(process.env.USE_DATA_FILE, 'utf-8')),
      timestamp: new Date().toISOString(),
    });
  }
  const repos = req.body.repos as string[] || [];
  const repoUris = Array.isArray(repos) ? repos : [repos];
  const monthPeriod = req.body.months ? parseInt(req.body.months, 10) : 5;

  console.log(`Analyzing ${repoUris.length} repositories...`);

  try {
    const results = await Promise.all(repoUris.map( url =>
      analyzeRepo(url, monthPeriod)
    ));
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error analyzing repositories: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
