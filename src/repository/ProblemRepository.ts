import { Problem } from '../domain/Problem';
import { SEED_PROBLEMS } from '../data/seedProblems';

export class ProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor() {
    // Seed initial problems
    for (const prob of SEED_PROBLEMS) {
      this.problems.set(prob.id, prob);
    }
  }

  public async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async findBySlug(slug: string): Promise<Problem | null> {
    for (const prob of this.problems.values()) {
      if (prob.slug === slug) return prob;
    }
    return null;
  }

  public async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }
}
