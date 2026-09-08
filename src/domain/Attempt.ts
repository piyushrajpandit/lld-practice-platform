import { Submission, SubmissionPayload } from './Submission';
import { FeedbackReport } from './FeedbackReport';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface AttemptProps {
  id: string;
  problemId: string;
  learnerId?: string;
  attemptNumber: number;
  status: AttemptStatus;
  submission: Submission;
  feedbackReport?: FeedbackReport;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  evaluatedAt?: Date;
}

export class Attempt {
  public readonly id: string;
  public readonly problemId: string;
  public readonly learnerId: string;
  public readonly attemptNumber: number;
  private _status: AttemptStatus;
  private _submission: Submission;
  private _feedbackReport?: FeedbackReport;
  private _failureReason?: string;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private _evaluatedAt?: Date;

  constructor(props: AttemptProps) {
    this.id = props.id;
    this.problemId = props.problemId;
    this.learnerId = props.learnerId || 'default-learner';
    this.attemptNumber = props.attemptNumber;
    this._status = props.status;
    this._submission = props.submission;
    this._feedbackReport = props.feedbackReport;
    this._failureReason = props.failureReason;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._evaluatedAt = props.evaluatedAt;
  }

  public get status(): AttemptStatus {
    return this._status;
  }

  public get submission(): Submission {
    return this._submission;
  }

  public get feedbackReport(): FeedbackReport | undefined {
    return this._feedbackReport;
  }

  public get failureReason(): string | undefined {
    return this._failureReason;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get evaluatedAt(): Date | undefined {
    return this._evaluatedAt;
  }

  // State Transition methods
  public markSubmitted(newSubmissionPayload?: SubmissionPayload): void {
    if (this._status === 'EVALUATING') {
      throw new Error('Cannot re-submit while evaluation is currently in progress.');
    }
    if (newSubmissionPayload) {
      this._submission = new Submission(newSubmissionPayload);
    }
    this._status = 'SUBMITTED';
    this._updatedAt = new Date();
  }

  public markEvaluating(): void {
    if (this._status !== 'SUBMITTED' && this._status !== 'DRAFT') {
      throw new Error(`Cannot transition to EVALUATING from status ${this._status}`);
    }
    this._status = 'EVALUATING';
    this._updatedAt = new Date();
  }

  public completeEvaluation(feedback: FeedbackReport): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot complete evaluation when status is ${this._status}`);
    }
    this._feedbackReport = feedback;
    this._status = 'COMPLETED';
    this._evaluatedAt = new Date();
    this._updatedAt = new Date();
  }

  public failEvaluation(reason: string): void {
    this._status = 'FAILED';
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      learnerId: this.learnerId,
      attemptNumber: this.attemptNumber,
      status: this._status,
      submission: {
        language: this._submission.language,
        code: this._submission.code,
        designExplanation: this._submission.designExplanation,
        classMappings: this._submission.classMappings,
        diagramSyntax: this._submission.diagramSyntax,
      },
      feedbackReport: this._feedbackReport,
      failureReason: this._failureReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      evaluatedAt: this._evaluatedAt ? this._evaluatedAt.toISOString() : null,
    };
  }
}
