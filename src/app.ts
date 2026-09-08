import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ProblemRepository } from './repository/ProblemRepository';
import { AttemptRepository } from './repository/AttemptRepository';
import { EvaluationService } from './services/EvaluationService';
import { ProblemController } from './controllers/ProblemController';
import { AttemptController } from './controllers/AttemptController';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  const problemRepo = new ProblemRepository();
  const attemptRepo = new AttemptRepository();
  const evalService = new EvaluationService(problemRepo, attemptRepo);

  const problemCtrl = new ProblemController(problemRepo);
  const attemptCtrl = new AttemptController(evalService);

  // Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/problems', problemCtrl.getAllProblems);
  app.get('/api/problems/:id', problemCtrl.getProblemById);

  app.post('/api/attempts', attemptCtrl.submitAttempt);
  app.get('/api/attempts/:id', attemptCtrl.getAttemptStatus);
  app.get('/api/problems/:problemId/attempts', attemptCtrl.getProblemHistory);

  // Serve static client bundle if built
  const clientDistPath = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  return app;
}
