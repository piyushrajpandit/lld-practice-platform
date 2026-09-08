import React, { useState } from 'react';
import { Problem, Submission } from '../types';
import { Code2, Lightbulb, Play, FileText, Layout, Layers, RefreshCw } from 'lucide-react';

interface PracticeStudioProps {
  problem: Problem;
  onSubmit: (submission: Submission) => void;
  isSubmitting: boolean;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  problem,
  onSubmit,
  isSubmitting,
}) => {
  const [activeLeftTab, setActiveLeftTab] = useState<'reqs' | 'rubric' | 'extensibility'>('reqs');
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'responsibilities' | 'tradeoffs' | 'diagram'>('code');

  const [language, setLanguage] = useState<'typescript' | 'java' | 'python'>('typescript');
  const [code, setCode] = useState<string>(problem.starterCode.ts || '');
  const [designExplanation, setDesignExplanation] = useState<string>(
    '### Design Assumptions & Trade-offs\n- Class encapsulation separating core domain objects from controllers.\n- Strategy pattern used for extensible business rules.\n- Handled potential concurrency edge cases using locking/synchronization.'
  );
  const [classMappingsText, setClassMappingsText] = useState<string>(
    'ParkingLot: Manages floors and orchestrates spot allocation facade.\nParkingSpot: Encapsulates spot state and vehicle occupancy.\nPaymentProcessor: Handles fee calculation and ticket checkout.'
  );
  const [diagramSyntax, setDiagramSyntax] = useState<string>(
    'classDiagram\n    class ParkingLot {\n      +assignSpot(Vehicle)\n      +processPayment(ParkingTicket)\n    }\n    class ParkingSpot {\n      +isOccupied: boolean\n    }\n    ParkingLot --> ParkingSpot'
  );

  const handleResetStarter = () => {
    if (language === 'typescript') setCode(problem.starterCode.ts || '');
    else if (language === 'java') setCode(problem.starterCode.java || '');
  };

  const handleSubmit = () => {
    const classMappings = classMappingsText
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [className, ...resp] = line.split(':');
        return { className: className.trim(), responsibility: resp.join(':').trim() };
      });

    onSubmit({
      language,
      code,
      designExplanation,
      classMappings,
      diagramSyntax,
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '420px 1fr',
      height: 'calc(100vh - 73px)',
      overflow: 'hidden',
    }}>
      {/* LEFT PANE */}
      <div style={{
        borderRight: '1px solid #27272a',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Left Sub-tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #27272a',
          background: '#000000',
        }}>
          <button
            onClick={() => setActiveLeftTab('reqs')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeLeftTab === 'reqs' ? '#18181b' : 'transparent',
              color: activeLeftTab === 'reqs' ? '#ffffff' : '#71717a',
              borderBottom: activeLeftTab === 'reqs' ? '2px solid #ffffff' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveLeftTab('rubric')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeLeftTab === 'rubric' ? '#18181b' : 'transparent',
              color: activeLeftTab === 'rubric' ? '#ffffff' : '#71717a',
              borderBottom: activeLeftTab === 'rubric' ? '2px solid #ffffff' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Evaluation Rubric
          </button>
          <button
            onClick={() => setActiveLeftTab('extensibility')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeLeftTab === 'extensibility' ? '#18181b' : 'transparent',
              color: activeLeftTab === 'extensibility' ? '#ffffff' : '#71717a',
              borderBottom: activeLeftTab === 'extensibility' ? '2px solid #ffffff' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Extensibility Challenge
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeLeftTab === 'reqs' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>{problem.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                {problem.description}
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
                Functional Requirements
              </h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '24px', color: '#f4f4f5', fontSize: '0.85rem' }}>
                {problem.requirements.map((req, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: 1.4 }}>{req}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#a1a1aa' }}>
                Design Constraints
              </h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '24px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                {problem.designConstraints.map((constraint, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: 1.4 }}>{constraint}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
                Expected Domain Entities
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {problem.domainConcepts.map((concept) => (
                  <span
                    key={concept}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: '#000000',
                      border: '1px solid #27272a',
                      fontFamily: 'var(--font-mono)',
                      color: '#f4f4f5',
                    }}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeLeftTab === 'rubric' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#ffffff' }}>
                Evaluation Rubric Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {problem.rubric.criteria.map((criterion) => (
                  <div key={criterion.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: '#000000',
                    border: '1px solid #27272a'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{criterion.name}</span>
                      <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 700 }}>
                        {criterion.weight}% Weight
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '8px' }}>
                      {criterion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeLeftTab === 'extensibility' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
                Extensibility Stress Test
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '20px' }}>
                A robust Low-Level Design accepts future requirement changes with zero modification to core classes (Open-Closed Principle).
              </p>

              {problem.extensibilityChallenges.map((challenge) => (
                <div key={challenge.id} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#000000',
                  border: '1px solid #27272a',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <Lightbulb size={18} color="#ffffff" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                      {challenge.prompt}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a1a1aa', paddingTop: '8px', borderTop: '1px dashed #27272a' }}>
                    <strong>Architecture Hint:</strong> {challenge.hint}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Editor Tabs Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#000000',
          borderBottom: '1px solid #27272a',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveEditorTab('code')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: activeEditorTab === 'code' ? '#18181b' : 'transparent',
                color: activeEditorTab === 'code' ? '#ffffff' : '#71717a',
                borderBottom: activeEditorTab === 'code' ? '2px solid #ffffff' : '2px solid transparent',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Code2 size={15} />
              <span>1. Code Implementation</span>
            </button>

            <button
              onClick={() => setActiveEditorTab('responsibilities')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: activeEditorTab === 'responsibilities' ? '#18181b' : 'transparent',
                color: activeEditorTab === 'responsibilities' ? '#ffffff' : '#71717a',
                borderBottom: activeEditorTab === 'responsibilities' ? '2px solid #ffffff' : '2px solid transparent',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Layout size={15} />
              <span>2. Class Responsibilities</span>
            </button>

            <button
              onClick={() => setActiveEditorTab('tradeoffs')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: activeEditorTab === 'tradeoffs' ? '#18181b' : 'transparent',
                color: activeEditorTab === 'tradeoffs' ? '#ffffff' : '#71717a',
                borderBottom: activeEditorTab === 'tradeoffs' ? '2px solid #ffffff' : '2px solid transparent',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileText size={15} />
              <span>3. Trade-offs & Assumptions</span>
            </button>

            <button
              onClick={() => setActiveEditorTab('diagram')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: activeEditorTab === 'diagram' ? '#18181b' : 'transparent',
                color: activeEditorTab === 'diagram' ? '#ffffff' : '#71717a',
                borderBottom: activeEditorTab === 'diagram' ? '2px solid #ffffff' : '2px solid transparent',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Layers size={15} />
              <span>4. Diagram / Mermaid Syntax</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={handleResetStarter}
              title="Reset to starter template"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Text Area Editors */}
        <div style={{ flex: 1, background: '#050505', padding: '16px', overflowY: 'auto' }}>
          {activeEditorTab === 'code' && (
            <textarea
              className="glass-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your object-oriented class definitions, interfaces, and methods..."
              style={{
                height: '100%',
                resize: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
              }}
            />
          )}

          {activeEditorTab === 'responsibilities' && (
            <textarea
              className="glass-input"
              value={classMappingsText}
              onChange={(e) => setClassMappingsText(e.target.value)}
              placeholder="ClassName: Responsibility description..."
              style={{
                height: '100%',
                resize: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
              }}
            />
          )}

          {activeEditorTab === 'tradeoffs' && (
            <textarea
              className="glass-input"
              value={designExplanation}
              onChange={(e) => setDesignExplanation(e.target.value)}
              placeholder="Explain your architectural decisions, trade-offs, and concurrency guarantees..."
              style={{
                height: '100%',
                resize: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
              }}
            />
          )}

          {activeEditorTab === 'diagram' && (
            <textarea
              className="glass-input"
              value={diagramSyntax}
              onChange={(e) => setDiagramSyntax(e.target.value)}
              placeholder="Mermaid or PlantUML class diagram representation..."
              style={{
                height: '100%',
                resize: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                background: 'transparent',
                border: 'none',
                color: '#f4f4f5',
              }}
            />
          )}
        </div>

        {/* Footer Action Bar */}
        <div style={{
          padding: '16px 24px',
          background: '#000000',
          borderTop: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.8rem', color: '#71717a' }}>
            Submit solution to trigger deterministic static analysis + AI architectural reasoning.
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '0.9rem',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Play size={16} />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
