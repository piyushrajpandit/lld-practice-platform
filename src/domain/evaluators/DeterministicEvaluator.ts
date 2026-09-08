import { Problem } from '../Problem';
import { Submission } from '../Submission';
import { IEvaluator, EvaluatorResult } from './Evaluator';
import { CriterionEvaluation, AntiPatternDetected } from '../FeedbackReport';

export class DeterministicEvaluator implements IEvaluator {
  public readonly name = 'DeterministicStaticEvaluator';

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluatorResult> {
    const criterionEvaluations: CriterionEvaluation[] = [];
    const antiPatterns: AntiPatternDetected[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    const code = submission.code;
    const explanation = submission.designExplanation;
    const declaredClasses = submission.extractDeclaredClasses();
    const lineCount = submission.getCodeLinesCount();

    // Check 1: Completeness & Minimum Volume
    let completenessScore = 100;
    if (lineCount < 10 && explanation.length < 50) {
      completenessScore = 30;
      antiPatterns.push({
        name: 'Incomplete Submission',
        description: 'Submission has fewer than 10 lines of code and minimal design explanation.',
        howToFix: 'Provide full class declarations and detail your design assumptions.',
      });
      recommendations.push('Flesh out class contracts and design trade-offs before submitting.');
    } else {
      strengths.push('Submission contains sufficient structural detail for architectural review.');
    }

    criterionEvaluations.push({
      criterionId: 'req-coverage',
      criterionName: 'Requirement Coverage & Completeness',
      score: completenessScore,
      maxScore: 100,
      weight: 20,
      evidence: `Code lines: ${lineCount}, Explanation length: ${explanation.length} chars.`,
      suggestion: completenessScore < 70 ? 'Expand on core method signatures and business logic assumptions.' : 'Good submission volume.',
    });

    // Check 2: Domain Concept Coverage
    let matchedConceptsCount = 0;
    const missingConcepts: string[] = [];
    const combinedText = (code + ' ' + explanation).toLowerCase();

    for (const concept of problem.domainConcepts) {
      if (combinedText.includes(concept.toLowerCase())) {
        matchedConceptsCount++;
      } else {
        missingConcepts.push(concept);
      }
    }

    const domainCoveragePercent = problem.domainConcepts.length > 0
      ? Math.round((matchedConceptsCount / problem.domainConcepts.length) * 100)
      : 100;

    if (missingConcepts.length > 0) {
      recommendations.push(`Consider adding domain abstractions for: ${missingConcepts.join(', ')}.`);
    } else {
      strengths.push('All key domain entities mentioned in problem requirements are represented.');
    }

    criterionEvaluations.push({
      criterionId: 'domain-modeling',
      criterionName: 'Domain Entity Modeling',
      score: domainCoveragePercent,
      maxScore: 100,
      weight: 25,
      evidence: `Identified ${matchedConceptsCount}/${problem.domainConcepts.length} core concepts (${missingConcepts.length > 0 ? 'Missing: ' + missingConcepts.join(', ') : 'All present'}).`,
      suggestion: missingConcepts.length > 0
        ? `Incorporate domain concepts: ${missingConcepts.join(', ')} into your class hierarchy.`
        : 'Strong domain concept coverage.',
    });

    // Check 3: Abstraction & Interface Presence
    const hasInterfaces = /interface\s+|abstract\s+class\s+/.test(code) || /interface|abstraction|polymorphism/i.test(explanation);
    let abstractionScore = hasInterfaces ? 90 : 50;

    if (!hasInterfaces && declaredClasses.length > 2) {
      antiPatterns.push({
        name: 'Concrete Class Overuse',
        description: 'Design relies entirely on concrete classes without abstractions or interfaces.',
        howToFix: 'Define interfaces for extensible behaviors (e.g., PaymentStrategy, PricingPolicy, Strategy Pattern).',
      });
      recommendations.push('Introduce interfaces to decouple concrete implementations.');
    } else if (hasInterfaces) {
      strengths.push('Uses interfaces or abstract classes to promote loose coupling.');
    }

    criterionEvaluations.push({
      criterionId: 'abstraction-interfaces',
      criterionName: 'Abstraction & Interface Design',
      score: abstractionScore,
      maxScore: 100,
      weight: 25,
      evidence: hasInterfaces ? 'Interfaces/Abstract entities detected in submission.' : 'Only concrete classes or plain text detected.',
      suggestion: hasInterfaces ? 'Maintain clear interface segregation.' : 'Decouple core dependencies using interfaces.',
    });

    // Check 4: Anti-pattern Heuristic - God Object
    if (declaredClasses.length === 1 && lineCount > 100) {
      antiPatterns.push({
        name: 'God Object (Monolithic Class)',
        description: 'Single class containing over 100 lines of code handling multiple responsibilities.',
        howToFix: 'Decompose the monolithic class into cohesive sub-components adhering to SRP.',
      });
    }

    const overallDeterministicScore = Math.round(
      (completenessScore * 0.2) + (domainCoveragePercent * 0.4) + (abstractionScore * 0.4)
    );

    return {
      evaluatorName: this.name,
      passed: true,
      scoreContribution: overallDeterministicScore,
      criterionEvaluations,
      antiPatterns,
      strengths,
      recommendations,
      notes: `Deterministic static analysis completed. Verified ${declaredClasses.length} class declarations.`,
    };
  }
}
