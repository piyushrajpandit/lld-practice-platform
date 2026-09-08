export interface RubricCriterion {
  id: string;
  name: string;
  weight: number; // Percentage weight e.g. 20
  description: string;
  scoringGuide: {
    excellent: string;
    satisfactory: string;
    needsImprovement: string;
  };
}

export interface Rubric {
  id: string;
  criteria: RubricCriterion[];
}

export interface ExtensibilityChallenge {
  id: string;
  prompt: string;
  hint: string;
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    public readonly category: string,
    public readonly description: string,
    public readonly requirements: string[],
    public readonly designConstraints: string[],
    public readonly domainConcepts: string[],
    public readonly rubric: Rubric,
    public readonly extensibilityChallenges: ExtensibilityChallenge[],
    public readonly starterCode: {
      ts?: string;
      java?: string;
      python?: string;
    },
    public readonly sampleSolutionSummary?: string
  ) {}

  public getCriterion(criterionId: string): RubricCriterion | undefined {
    return this.rubric.criteria.find((c) => c.id === criterionId);
  }
}
