import fs from 'fs';
import path from 'path';
import { Attempt } from '../domain/Attempt';
import { Submission } from '../domain/Submission';
import { FeedbackReport } from '../domain/FeedbackReport';

export class AttemptRepository {
  private attempts: Map<string, Attempt> = new Map();
  private filePath: string;

  constructor(storageDir?: string) {
    const dir = storageDir || path.join(__dirname, '../../data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.join(dir, 'attempts_store.json');
    this.loadFromDisk();
  }

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
    this.persistToDisk();
  }

  public async findById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async findByProblemId(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt[]> {
    const list: Attempt[] = [];
    for (const att of this.attempts.values()) {
      if (att.problemId === problemId && att.learnerId === learnerId) {
        list.push(att);
      }
    }
    // Sort chronologically by attempt number
    return list.sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  public async getNextAttemptNumber(problemId: string, learnerId: string = 'default-learner'): Promise<number> {
    const existing = await this.findByProblemId(problemId, learnerId);
    return existing.length + 1;
  }

  private persistToDisk(): void {
    try {
      const data = Array.from(this.attempts.values()).map((a) => a.toJSON());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist attempts to disk:', err);
    }
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const submission = new Submission({
            language: item.submission?.language || 'typescript',
            code: item.submission?.code || '',
            designExplanation: item.submission?.designExplanation || '',
            classMappings: item.submission?.classMappings || [],
            diagramSyntax: item.submission?.diagramSyntax,
          });

          let feedbackReport: FeedbackReport | undefined = undefined;
          if (item.feedbackReport) {
            feedbackReport = new FeedbackReport(item.feedbackReport);
          }

          const attempt = new Attempt({
            id: item.id,
            problemId: item.problemId,
            learnerId: item.learnerId,
            attemptNumber: item.attemptNumber,
            status: item.status,
            submission,
            feedbackReport,
            failureReason: item.failureReason,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            evaluatedAt: item.evaluatedAt ? new Date(item.evaluatedAt) : undefined,
          });

          this.attempts.set(attempt.id, attempt);
        }
      }
    } catch (err) {
      console.warn('Could not load attempts from disk:', err);
    }
  }
}
