export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  scoringGuide: {
    excellent: string;
    satisfactory: string;
    needsImprovement: string;
  };
}

export interface ExtensibilityChallenge {
  id: string;
  prompt: string;
  hint: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  description: string;
  requirements: string[];
  designConstraints: string[];
  domainConcepts: string[];
  rubric: {
    id: string;
    criteria: RubricCriterion[];
  };
  extensibilityChallenges: ExtensibilityChallenge[];
  starterCode: {
    ts?: string;
    java?: string;
    python?: string;
  };
  sampleSolutionSummary?: string;
}

export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  weight: number;
  evidence: string;
  concern?: string;
  suggestion: string;
}

export interface AntiPatternDetected {
  name: string;
  description: string;
  locationOrSnippet?: string;
  howToFix: string;
}

export interface FeedbackReport {
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

export interface Submission {
  language: string;
  code: string;
  designExplanation: string;
  classMappings?: { className: string; responsibility: string }[];
  diagramSyntax?: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId: string;
  attemptNumber: number;
  status: 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
  submission: Submission;
  feedbackReport?: FeedbackReport;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  evaluatedAt?: string;
}
