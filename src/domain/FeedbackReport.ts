export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  score: number; // 0 - 100
  maxScore: number; // 100
  weight: number;
  evidence: string; // Specific line/code snippet or class reference evidence
  concern?: string;
  suggestion: string;
}

export interface AntiPatternDetected {
  name: string; // e.g. "God Object", "Tight Coupling", "Leaky Abstraction"
  description: string;
  locationOrSnippet?: string;
  howToFix: string;
}

export interface FeedbackReportPayload {
  overallScore: number;
  grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_REFINEMENT' | 'INCOMPLETE';
  summary: string;
  criterionEvaluations: CriterionEvaluation[];
  strengths: string[];
  antiPatterns: AntiPatternDetected[];
  recommendations: string[];
  extensibilityAnalysis: string;
  evaluatorMetadata: {
    deterministicChecksPassed: number;
    deterministicChecksTotal: number;
    llmUsed: boolean;
    evaluatorVersion: string;
  };
}

export class FeedbackReport {
  public readonly overallScore: number;
  public readonly grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_REFINEMENT' | 'INCOMPLETE';
  public readonly summary: string;
  public readonly criterionEvaluations: CriterionEvaluation[];
  public readonly strengths: string[];
  public readonly antiPatterns: AntiPatternDetected[];
  public readonly recommendations: string[];
  public readonly extensibilityAnalysis: string;
  public readonly evaluatorMetadata: {
    deterministicChecksPassed: number;
    deterministicChecksTotal: number;
    llmUsed: boolean;
    evaluatorVersion: string;
  };

  constructor(payload: FeedbackReportPayload) {
    this.overallScore = Math.max(0, Math.min(100, Math.round(payload.overallScore)));
    this.grade = payload.grade;
    this.summary = payload.summary;
    this.criterionEvaluations = payload.criterionEvaluations || [];
    this.strengths = payload.strengths || [];
    this.antiPatterns = payload.antiPatterns || [];
    this.recommendations = payload.recommendations || [];
    this.extensibilityAnalysis = payload.extensibilityAnalysis || '';
    this.evaluatorMetadata = payload.evaluatorMetadata;
  }
}
