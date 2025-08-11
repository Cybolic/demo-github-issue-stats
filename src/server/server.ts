import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import api from './api.js';
import type { Application } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 9000;

app.use(express.json({ limit: "20mb" }));
app.use(cors());

// Our API
app.use('/api/v1', api);

// Our client-side static files
if (process.env.SERVER_API_ONLY === undefined) {
  console.log(`Serving static files from: ${path.join(__dirname, '../public')}`);
  app.use(express.static(path.join(__dirname, '../public')));
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub Issues API available at http://localhost:${PORT}/api/v1/github-issues`);
});

