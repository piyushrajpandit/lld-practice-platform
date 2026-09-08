export interface ClassMapping {
  className: string;
  responsibility: string;
  designPatternUsed?: string;
}

export interface SubmissionPayload {
  language: 'typescript' | 'java' | 'python' | 'pseudocode' | 'text';
  code: string;
  designExplanation: string;
  classMappings?: ClassMapping[];
  diagramSyntax?: string; // Change Test A readiness (e.g. Mermaid or PlantUML)
}

export class Submission {
  public readonly language: string;
  public readonly code: string;
  public readonly designExplanation: string;
  public readonly classMappings: ClassMapping[];
  public readonly diagramSyntax?: string;

  constructor(payload: SubmissionPayload) {
    if (!payload.code && !payload.designExplanation) {
      throw new Error('Submission must contain code or design explanation.');
    }
    this.language = payload.language || 'typescript';
    this.code = payload.code || '';
    this.designExplanation = payload.designExplanation || '';
    this.classMappings = payload.classMappings || [];
    this.diagramSyntax = payload.diagramSyntax;
  }

  public getCodeLinesCount(): number {
    if (!this.code) return 0;
    return this.code.split('\n').filter((line) => line.trim().length > 0).length;
  }

  public hasClassOrInterfaceKeywords(): boolean {
    const keywords = ['class ', 'interface ', 'abstract ', 'implements ', 'extends ', 'enum '];
    const lowerCode = this.code.toLowerCase();
    return keywords.some((kw) => lowerCode.includes(kw));
  }

  public extractDeclaredClasses(): string[] {
    const classMatches = this.code.match(/(?:class|interface|enum)\s+([A-Za-z0-9_]+)/g);
    if (!classMatches) return [];
    return classMatches.map((m) => m.split(/\s+/)[1]);
  }
}
