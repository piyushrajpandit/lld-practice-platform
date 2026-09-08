import { Problem } from '../Problem';
import { Submission } from '../Submission';
import { IEvaluator } from './Evaluator';
import { FeedbackReport, CriterionEvaluation, AntiPatternDetected } from '../FeedbackReport';

export class EvaluationPipeline {
  private evaluators: IEvaluator[] = [];

  constructor(evaluators?: IEvaluator[]) {
    if (evaluators && evaluators.length > 0) {
      this.evaluators = evaluators;
    }
  }

  // Support Change Test B: Adding evaluators dynamically without code rewrites
  public registerEvaluator(evaluator: IEvaluator): void {
    this.evaluators.push(evaluator);
  }

  public async runPipeline(problem: Problem, submission: Submission): Promise<FeedbackReport> {
    if (this.evaluators.length === 0) {
      throw new Error('EvaluationPipeline has no evaluators registered.');
    }

    const allCriterionEvaluations: CriterionEvaluation[] = [];
    const allAntiPatterns: AntiPatternDetected[] = [];
    const allStrengths: string[] = [];
    const allRecommendations: string[] = [];
    const scores: number[] = [];
    let deterministicPassedCount = 0;
    let totalDeterministicChecks = 0;
    let llmUsed = false;

    for (const evaluator of this.evaluators) {
      try {
        const res = await evaluator.evaluate(problem, submission);
        scores.push(res.scoreContribution);
        allCriterionEvaluations.push(...res.criterionEvaluations);
        allAntiPatterns.push(...res.antiPatterns);
        allStrengths.push(...res.strengths);
        allRecommendations.push(...res.recommendations);

        if (evaluator.name.includes('Deterministic')) {
          deterministicPassedCount += res.passed ? 1 : 0;
          totalDeterministicChecks += 1;
        }
        if (evaluator.name.includes('LLM')) {
          llmUsed = true;
        }
      } catch (err) {
        console.error(`Evaluator ${evaluator.name} encountered an error:`, err);
      }
    }

    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 50;

    let grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_REFINEMENT' | 'INCOMPLETE' = 'NEEDS_REFINEMENT';
    if (overallScore >= 88) grade = 'EXCELLENT';
    else if (overallScore >= 75) grade = 'GOOD';
    else if (overallScore >= 50) grade = 'NEEDS_REFINEMENT';
    else grade = 'INCOMPLETE';

    // Deduplicate lists
    const uniqueStrengths = Array.from(new Set(allStrengths));
    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    const extensibilityAnalysis = problem.extensibilityChallenges && problem.extensibilityChallenges.length > 0
      ? `To satisfy extensibility challenge "${problem.extensibilityChallenges[0].prompt}": Ensure class boundaries allow adding this requirement via polymorphism without modifying existing core classes (OCP).`
      : 'Design evaluated for general extensibility and maintainability.';

    return new FeedbackReport({
      overallScore,
      grade,
      summary: `Design evaluated with score ${overallScore}/100 (${grade}). ${allAntiPatterns.length > 0 ? `Identified ${allAntiPatterns.length} potential design concerns.` : 'No major design anti-patterns detected.'}`,
      criterionEvaluations: allCriterionEvaluations,
      strengths: uniqueStrengths,
      antiPatterns: allAntiPatterns,
      recommendations: uniqueRecommendations,
      extensibilityAnalysis,
      evaluatorMetadata: {
        deterministicChecksPassed: deterministicPassedCount,
        deterministicChecksTotal: totalDeterministicChecks,
        llmUsed,
        evaluatorVersion: 'v1.0.0-hybrid',
      },
    });
  }
}
