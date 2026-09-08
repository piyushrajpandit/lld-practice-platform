import { Request, Response } from 'express';
import { ProblemRepository } from '../repository/ProblemRepository';

export class ProblemController {
  constructor(private problemRepo: ProblemRepository) {}

  public getAllProblems = async (req: Request, res: Response): Promise<void> => {
    try {
      const problems = await this.problemRepo.findAll();
      res.json({ success: true, count: problems.length, data: problems });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getProblemById = async (req: Request, res: Response): Promise<void> => {
    try {
      const problem = await this.problemRepo.findById(req.params.id);
      if (!problem) {
        res.status(404).json({ success: false, error: 'Problem not found' });
        return;
      }
      res.json({ success: true, data: problem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
