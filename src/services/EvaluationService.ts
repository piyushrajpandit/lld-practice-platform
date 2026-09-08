import { v4 as uuidv4 } from 'uuid';
import { ProblemRepository } from '../repository/ProblemRepository';
import { AttemptRepository } from '../repository/AttemptRepository';
import { Attempt } from '../domain/Attempt';
import { Submission, SubmissionPayload } from '../domain/Submission';
import { EvaluationPipeline } from '../domain/evaluators/EvaluationPipeline';
import { DeterministicEvaluator } from '../domain/evaluators/DeterministicEvaluator';
import { LLMEvaluator } from '../domain/evaluators/LLMEvaluator';

export class EvaluationService {
  private pipeline: EvaluationPipeline;

  constructor(
    private problemRepo: ProblemRepository,
    private attemptRepo: AttemptRepository,
    pipeline?: EvaluationPipeline
  ) {
    if (pipeline) {
      this.pipeline = pipeline;
    } else {
      this.pipeline = new EvaluationPipeline([
        new DeterministicEvaluator(),
        new LLMEvaluator(),
      ]);
    }
  }

  public async submitAttempt(
    problemId: string,
    submissionPayload: SubmissionPayload,
    learnerId: string = 'default-learner'
  ): Promise<Attempt> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error(`Problem with ID '${problemId}' not found.`);
    }

    const attemptNumber = await this.attemptRepo.getNextAttemptNumber(problemId, learnerId);
    const submission = new Submission(submissionPayload);

    const attempt = new Attempt({
      id: uuidv4(),
      problemId,
      learnerId,
      attemptNumber,
      status: 'SUBMITTED',
      submission,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save initial submitted attempt
    await this.attemptRepo.save(attempt);

    // Non-blocking async evaluation launch
    setImmediate(() => {
      this.processEvaluation(attempt.id).catch((err) => {
        console.error(`Async evaluation failed for attempt ${attempt.id}:`, err);
      });
    });

    return attempt;
  }

  public async processEvaluation(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt '${attemptId}' not found.`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      attempt.failEvaluation(`Problem '${attempt.problemId}' no longer exists.`);
      await this.attemptRepo.save(attempt);
      return attempt;
    }

    try {
      attempt.markEvaluating();
      await this.attemptRepo.save(attempt);

      const feedback = await this.pipeline.runPipeline(problem, attempt.submission);
      attempt.completeEvaluation(feedback);
      await this.attemptRepo.save(attempt);

      return attempt;
    } catch (err: any) {
      attempt.failEvaluation(err.message || 'An unexpected error occurred during evaluation.');
      await this.attemptRepo.save(attempt);
      return attempt;
    }
  }

  public async getAttempt(attemptId: string): Promise<Attempt | null> {
    return this.attemptRepo.findById(attemptId);
  }

  public async getAttemptHistory(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt[]> {
    return this.attemptRepo.findByProblemId(problemId, learnerId);
  }
}
