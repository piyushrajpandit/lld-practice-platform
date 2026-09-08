import { Problem } from '../Problem';
import { Submission } from '../Submission';
import { IEvaluator, EvaluatorResult } from './Evaluator';
import { CriterionEvaluation, AntiPatternDetected } from '../FeedbackReport';

export class LLMEvaluator implements IEvaluator {
  public readonly name = 'LLMArchitecturalEvaluator';

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluatorResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const liveResult = await this.evaluateWithLLMApi(problem, submission, apiKey);
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn('LLM API call failed, switching to resilient heuristic architectural evaluator fallback:', err);
      }
    }

    // Resilient Fallback Architectural Evaluator
    return this.evaluateWithFallbackReasoning(problem, submission);
  }

  private async evaluateWithLLMApi(
    problem: Problem,
    submission: Submission,
    apiKey: string
  ): Promise<EvaluatorResult | null> {
    const prompt = this.buildStructuredPrompt(problem, submission);
    
    // Attempt Gemini API call via standard fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return null;

    const parsed = JSON.parse(textOutput);
    return {
      evaluatorName: this.name,
      passed: true,
      scoreContribution: parsed.overallScore || 75,
      criterionEvaluations: parsed.criterionEvaluations || [],
      antiPatterns: parsed.antiPatterns || [],
      strengths: parsed.strengths || [],
      recommendations: parsed.recommendations || [],
      notes: 'Live LLM architectural evaluation completed via Gemini API.',
    };
  }

  private buildStructuredPrompt(problem: Problem, submission: Submission): string {
    return `
You are an expert Principal Software Architect evaluating a Low-Level Design (LLD) submission.

PROBLEM TITLE: ${problem.title}
REQUIREMENTS: ${JSON.stringify(problem.requirements)}
CONSTRAINTS: ${JSON.stringify(problem.designConstraints)}
DOMAIN CONCEPTS: ${JSON.stringify(problem.domainConcepts)}
EXTENSIBILITY CHALLENGE: ${JSON.stringify(problem.extensibilityChallenges)}

SUBMISSION:
Language: ${submission.language}
Code:
${submission.code}

Design Explanation & Trade-offs:
${submission.designExplanation}

Class Mappings:
${JSON.stringify(submission.classMappings)}

Rubric Criteria to Evaluate:
${problem.rubric.criteria.map((c) => `- ${c.name} (${c.weight}%): ${c.description}`).join('\n')}

Evaluate the submission strictly against the rubric. Provide evidence from the user's code or explanation.
Return ONLY valid JSON matching this schema:
{
  "overallScore": number (0-100),
  "criterionEvaluations": [
    {
      "criterionId": string,
      "criterionName": string,
      "score": number (0-100),
      "maxScore": 100,
      "weight": number,
      "evidence": string,
      "concern": string,
      "suggestion": string
    }
  ],
  "strengths": [string],
  "antiPatterns": [
    {
      "name": string,
      "description": string,
      "locationOrSnippet": string,
      "howToFix": string
    }
  ],
  "recommendations": [string],
  "extensibilityAnalysis": string
}
`;
  }

  private evaluateWithFallbackReasoning(problem: Problem, submission: Submission): EvaluatorResult {
    const code = submission.code;
    const exp = submission.designExplanation.toLowerCase();
    const declaredClasses = submission.extractDeclaredClasses();

    const criterionEvaluations: CriterionEvaluation[] = [];
    const antiPatterns: AntiPatternDetected[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    // SRP & Responsibility Analysis
    const isSrpGood = declaredClasses.length >= 3 && submission.getCodeLinesCount() / (declaredClasses.length || 1) < 60;
    const srpScore = isSrpGood ? 88 : 62;
    criterionEvaluations.push({
      criterionId: 'srp-cohesion',
      criterionName: 'Single Responsibility & Class Cohesion',
      score: srpScore,
      maxScore: 100,
      weight: 25,
      evidence: `Declared ${declaredClasses.length} distinct domain entities (${declaredClasses.join(', ') || 'None'}).`,
      concern: isSrpGood ? undefined : 'Classes appear to take on multiple duties or lack clear responsibility boundaries.',
      suggestion: isSrpGood
        ? 'Well-separated responsibilities across classes.'
        : 'Separate state management, business rules, and notification/payment handling into distinct classes.',
    });

    // SOLID & Extensibility Analysis
    const hasStrategyPattern = /strategy|factory|observer|state|adapter/i.test(code + ' ' + exp);
    const extensibilityScore = hasStrategyPattern ? 92 : 68;

    if (hasStrategyPattern) {
      strengths.push('Demonstrates appropriate design pattern usage (e.g. Strategy/Factory/State) to support Open-Closed Principle (OCP).');
    } else {
      recommendations.push('Apply the Strategy or Factory pattern to make pricing/routing algorithms easily extensible.');
    }

    criterionEvaluations.push({
      criterionId: 'extensibility-ocp',
      criterionName: 'Extensibility & SOLID Principles',
      score: extensibilityScore,
      maxScore: 100,
      weight: 25,
      evidence: hasStrategyPattern ? 'Design patterns and interface abstractions detected.' : 'Direct switch/if-else branching used for behavior variance.',
      suggestion: hasStrategyPattern
        ? 'Solid adherence to OCP (Open-Closed Principle).'
        : 'Replace conditional branching (if/switch) with polymorphic interfaces to make future extensions zero-risk.',
    });

    // Coupling & Dependency Injection
    const usesDI = /constructor\([^)]*(service|repository|manager|processor|strategy)/i.test(code) || /dependency injection|inversion of control|dip/i.test(exp);
    const dipScore = usesDI ? 90 : 65;

    criterionEvaluations.push({
      criterionId: 'coupling-dip',
      criterionName: 'Loose Coupling & Dependency Inversion',
      score: dipScore,
      maxScore: 100,
      weight: 25,
      evidence: usesDI ? 'Dependencies injected via constructors or factory methods.' : 'Direct instantiation (new Keyword) inside high-level controllers.',
      concern: usesDI ? undefined : 'High-level classes directly instantiate concrete dependencies using `new`.',
      suggestion: usesDI
        ? 'Great job injecting interfaces into constructors.'
        : 'Inject interfaces via constructors (DIP) rather than instantiating concrete classes internally.',
    });

    // Edge Cases & Trade-offs
    const discussesConcurrency = /thread|lock|sync|atomic|concurrent|race condition|idempotent|queue|error/i.test(code + ' ' + exp);
    const edgeCaseScore = discussesConcurrency ? 85 : 60;

    if (!discussesConcurrency) {
      antiPatterns.push({
        name: 'Unaddressed Concurrency & Edge Cases',
        description: 'Design does not account for race conditions, concurrent requests, or hardware failure edge cases.',
        howToFix: 'Document thread-safety mechanisms (e.g. Mutex locks, Atomic integer slots, or optimistic concurrency).',
      });
      recommendations.push('Address concurrent booking/payment access and edge case handling in your design trade-offs.');
    } else {
      strengths.push('Includes explicit considerations for concurrency, locking, or failure recovery.');
    }

    criterionEvaluations.push({
      criterionId: 'edge-cases-tradeoffs',
      criterionName: 'Edge Cases & Trade-off Analysis',
      score: edgeCaseScore,
      maxScore: 100,
      weight: 25,
      evidence: discussesConcurrency ? 'Concurrency and edge case keywords present in solution.' : 'No concurrency or fail-safe logic documented.',
      suggestion: discussesConcurrency
        ? 'Clear trade-off reasoning.'
        : 'Elaborate on what happens under high load, concurrency collisions, or system component downtime.',
    });

    // Overall composite calculation
    const overallScore = Math.round((srpScore + extensibilityScore + dipScore + edgeCaseScore) / 4);

    return {
      evaluatorName: `${this.name} (Heuristic Reasoner)`,
      passed: true,
      scoreContribution: overallScore,
      criterionEvaluations,
      antiPatterns,
      strengths: strengths.length > 0 ? strengths : ['Good initial structure and submission clarity.'],
      recommendations,
      notes: 'Executed heuristic architectural reasoning engine.',
    };
  }
}
