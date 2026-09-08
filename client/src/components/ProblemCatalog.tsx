import React from 'react';
import { Problem } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface ProblemCatalogProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  attemptsMap: Record<string, number>;
}

export const ProblemCatalog: React.FC<ProblemCatalogProps> = ({
  problems,
  onSelectProblem,
  attemptsMap,
}) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      {/* Hero Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
        padding: '40px 36px',
        borderRadius: '16px',
        background: '#09090b',
        border: '1px solid #27272a',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#a1a1aa',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          <Sparkles size={14} color="#ffffff" />
          <span>Interactive Low-Level Design Practice</span>
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px', color: '#ffffff' }}>
          Master Object-Oriented Architecture
        </h2>
        <p style={{ color: '#a1a1aa', maxWidth: '680px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
          Select a real-world LLD problem, design clean class abstractions & responsibilities, submit your solution, and receive explainable rubric-driven feedback.
        </p>
      </div>

      {/* Grid of Problems */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
      }}>
        {problems.map((problem) => {
          const attemptCount = attemptsMap[problem.id] || 0;
          return (
            <div
              key={problem.id}
              className="glass-card"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => onSelectProblem(problem)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    border: '1px solid #27272a',
                  }}>
                    {problem.difficulty}
                  </span>

                  <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} />
                    {problem.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
                  {problem.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  {problem.description}
                </p>

                {/* Key Concepts Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {problem.domainConcepts.slice(0, 5).map((concept) => (
                    <span
                      key={concept}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#000000',
                        border: '1px solid #27272a',
                        color: '#f4f4f5',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #27272a',
                marginTop: '12px',
              }}>
                <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                  {attemptCount > 0 ? (
                    <span style={{ color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> {attemptCount} Attempt{attemptCount > 1 ? 's' : ''} logged
                    </span>
                  ) : (
                    'Not attempted yet'
                  )}
                </span>

                <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  <span>Practice Problem</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
