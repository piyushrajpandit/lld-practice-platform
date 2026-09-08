import { Problem } from '../Problem';
import { Submission } from '../Submission';
import { CriterionEvaluation, AntiPatternDetected } from '../FeedbackReport';

export interface EvaluatorResult {
  evaluatorName: string;
  passed: boolean;
  scoreContribution: number; // 0 to 100
  criterionEvaluations: CriterionEvaluation[];
  antiPatterns: AntiPatternDetected[];
  strengths: string[];
  recommendations: string[];
  notes: string;
}

export interface IEvaluator {
  name: string;
  evaluate(problem: Problem, submission: Submission): Promise<EvaluatorResult>;
}
