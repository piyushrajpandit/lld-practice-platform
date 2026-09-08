import { Request, Response } from 'express';
import { EvaluationService } from '../services/EvaluationService';

export class AttemptController {
  constructor(private evalService: EvaluationService) {}

  public submitAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { problemId, language, code, designExplanation, classMappings, diagramSyntax, learnerId } = req.body;

      if (!problemId) {
        res.status(400).json({ success: false, error: 'problemId is required' });
        return;
      }

      const attempt = await this.evalService.submitAttempt(
        problemId,
        {
          language: language || 'typescript',
          code: code || '',
          designExplanation: designExplanation || '',
          classMappings: classMappings || [],
          diagramSyntax,
        },
        learnerId || 'default-learner'
      );

      res.status(202).json({
        success: true,
        message: 'Attempt submitted successfully. Evaluation in progress.',
        data: attempt.toJSON(),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

  public getAttemptStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const attempt = await this.evalService.getAttempt(req.params.id);
      if (!attempt) {
        res.status(404).json({ success: false, error: 'Attempt not found' });
        return;
      }
      res.json({ success: true, data: attempt.toJSON() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getProblemHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { problemId } = req.params;
      const learnerId = (req.query.learnerId as string) || 'default-learner';
      const history = await this.evalService.getAttemptHistory(problemId, learnerId);
      res.json({
        success: true,
        count: history.length,
        data: history.map((a) => a.toJSON()),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
