import request from 'supertest';
import { createApp } from '../src/app';
import { Attempt } from '../src/domain/Attempt';
import { Submission } from '../src/domain/Submission';
import { FeedbackReport } from '../src/domain/FeedbackReport';
import { DeterministicEvaluator } from '../src/domain/evaluators/DeterministicEvaluator';
import { LLMEvaluator } from '../src/domain/evaluators/LLMEvaluator';
import { EvaluationPipeline } from '../src/domain/evaluators/EvaluationPipeline';
import { SEED_PROBLEMS } from '../src/data/seedProblems';

describe('LLD Platform Domain Core Tests', () => {
  test('Submission correctly parses lines of code and extracts declared classes', () => {
    const sub = new Submission({
      language: 'typescript',
      code: `
        export interface Vehicle {}
        export class Car implements Vehicle {}
        export class ParkingSpot {}
      `,
      designExplanation: 'Sample explanation for parking lot system',
    });

    expect(sub.getCodeLinesCount()).toBe(3);
    expect(sub.hasClassOrInterfaceKeywords()).toBe(true);
    expect(sub.extractDeclaredClasses()).toEqual(['Vehicle', 'Car', 'ParkingSpot']);
  });

  test('Attempt enforces valid state transitions and guards against illegal transitions', () => {
    const sub = new Submission({ language: 'typescript', code: 'class Test {}', designExplanation: 'test' });
    const attempt = new Attempt({
      id: 'test-1',
      problemId: 'parking-lot',
      attemptNumber: 1,
      status: 'SUBMITTED',
      submission: sub,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(attempt.status).toBe('SUBMITTED');

    // Transition to EVALUATING
    attempt.markEvaluating();
    expect(attempt.status).toBe('EVALUATING');

    // Invalid transition test: cannot mark submitted while evaluating
    expect(() => attempt.markSubmitted()).toThrow('Cannot re-submit while evaluation is currently in progress.');

    // Transition to COMPLETED
    const feedback = new FeedbackReport({
      overallScore: 85,
      grade: 'GOOD',
      summary: 'Good design',
      criterionEvaluations: [],
      strengths: ['Clean SRP'],
      antiPatterns: [],
      recommendations: ['Add concurrency locks'],
      extensibilityAnalysis: 'Good OCP',
      evaluatorMetadata: { deterministicChecksPassed: 1, deterministicChecksTotal: 1, llmUsed: true, evaluatorVersion: 'v1' },
    });

    attempt.completeEvaluation(feedback);
    expect(attempt.status).toBe('COMPLETED');
    expect(attempt.feedbackReport?.overallScore).toBe(85);
  });

  test('DeterministicEvaluator assesses domain concept coverage and interfaces', async () => {
    const problem = SEED_PROBLEMS[0]; // Parking Lot
    const evaluator = new DeterministicEvaluator();

    const goodSub = new Submission({
      language: 'typescript',
      code: `
        export interface PricingStrategy { calculateFee(): number; }
        export class ParkingLot {}
        export class Floor {}
        export class ParkingSpot {}
        export class Vehicle {}
        export class ParkingTicket {}
        export class PaymentProcessor {}
      `,
      designExplanation: 'Extensive explanation covering all entities and pricing strategy.',
    });

    const res = await evaluator.evaluate(problem, goodSub);
    expect(res.passed).toBe(true);
    expect(res.scoreContribution).toBeGreaterThanOrEqual(70);
    expect(res.strengths.length).toBeGreaterThan(0);
  });

  test('LLMEvaluator fallback reasoning operates resilience without external API key', async () => {
    const problem = SEED_PROBLEMS[0];
    const evaluator = new LLMEvaluator();

    const sub = new Submission({
      language: 'typescript',
      code: `
        export interface SpotAssignmentStrategy { assignSpot(v: Vehicle): ParkingSpot; }
        export class ParkingLot {
          constructor(private strategy: SpotAssignmentStrategy) {}
        }
      `,
      designExplanation: 'Applied Strategy pattern and dependency injection to avoid tight coupling.',
    });

    const res = await evaluator.evaluate(problem, sub);
    expect(res.passed).toBe(true);
    expect(res.scoreContribution).toBeGreaterThanOrEqual(60);
  });

  test('EvaluationPipeline aggregates evaluations into FeedbackReport', async () => {
    const problem = SEED_PROBLEMS[0];
    const pipeline = new EvaluationPipeline([
      new DeterministicEvaluator(),
      new LLMEvaluator(),
    ]);

    const sub = new Submission({
      language: 'typescript',
      code: 'class ParkingLot {}',
      designExplanation: 'Simple attempt',
    });

    const feedback = await pipeline.runPipeline(problem, sub);
    expect(feedback.overallScore).toBeGreaterThan(0);
    expect(feedback.grade).toBeDefined();
    expect(feedback.criterionEvaluations.length).toBeGreaterThan(0);
  });
});

describe('REST API Endpoints', () => {
  const app = createApp();

  test('GET /api/problems returns list of problems', async () => {
    const res = await request(app).get('/api/problems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  test('POST /api/attempts creates attempt and starts async evaluation', async () => {
    const res = await request(app).post('/api/attempts').send({
      problemId: 'parking-lot',
      language: 'typescript',
      code: 'class Vehicle {}\nclass ParkingLot {}',
      designExplanation: 'Parking lot system with single responsibility',
    });

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    const attemptId = res.body.data.id;
    expect(attemptId).toBeDefined();

    // Wait 250ms for setImmediate async pipeline execution
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pollRes = await request(app).get(`/api/attempts/${attemptId}`);
    expect(pollRes.status).toBe(200);
    expect(pollRes.body.data.status).toBe('COMPLETED');
    expect(pollRes.body.data.feedbackReport).toBeDefined();
  });
});
