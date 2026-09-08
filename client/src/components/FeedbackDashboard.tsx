import React from 'react';
import { FeedbackReport, Problem } from '../types';
import { AlertTriangle, CheckCircle, Lightbulb, RefreshCw, Layers } from 'lucide-react';

interface FeedbackDashboardProps {
  problem: Problem;
  feedback: FeedbackReport;
  attemptNumber: number;
  onTryAgain: () => void;
  onViewHistory: () => void;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  problem,
  feedback,
  attemptNumber,
  onTryAgain,
  onViewHistory,
}) => {
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'EXCELLENT':
        return { label: 'EXCELLENT ARCHITECTURE', color: '#10b981', bg: '#064e3b20' };
      case 'GOOD':
        return { label: 'GOOD DESIGN', color: '#3b82f6', bg: '#1e3a8a20' };
      case 'NEEDS_REFINEMENT':
        return { label: 'NEEDS REFINEMENT', color: '#f59e0b', bg: '#78350f20' };
      default:
        return { label: 'INCOMPLETE', color: '#ef4444', bg: '#7f1d1d20' };
    }
  };

  const badge = getGradeBadge(feedback.grade);

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: badge.color,
                background: badge.bg,
                border: `1px solid ${badge.color}40`,
              }}>
                {badge.label}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Attempt #{attemptNumber} evaluated for <strong style={{ color: '#ffffff' }}>{problem.title}</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
              Design Evaluation Report
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.92rem', maxWidth: '650px', lineHeight: 1.5 }}>
              {feedback.summary}
            </p>
          </div>

          {/* Radial Score Indicator */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 36px',
            borderRadius: '12px',
            background: '#000000',
            border: '1px solid #27272a',
          }}>
            <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              {feedback.overallScore}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
              Out of 100
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Strengths vs Anti-Patterns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Strengths Card */}
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#10b981' }}>
            <CheckCircle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Design Strengths</h3>
          </div>
          <ul style={{ paddingLeft: '20px', color: '#f4f4f5', fontSize: '0.88rem' }}>
            {feedback.strengths.map((str, idx) => (
              <li key={idx} style={{ marginBottom: '10px', lineHeight: 1.4 }}>{str}</li>
            ))}
          </ul>
        </div>

        {/* Anti-Patterns Card */}
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Anti-Patterns & Concerns</h3>
          </div>
          {feedback.antiPatterns.length > 0 ? (
            feedback.antiPatterns.map((ap, idx) => (
              <div key={idx} style={{ marginBottom: '12px', fontSize: '0.88rem' }}>
                <strong style={{ color: '#f59e0b' }}>{ap.name}:</strong> {ap.description}
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>
                  💡 <em>Fix: {ap.howToFix}</em>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem' }}>No critical anti-patterns detected.</p>
          )}
        </div>
      </div>

      {/* Rubric Criteria Detailed Breakdown */}
      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
        Rubric Breakdown & Evidence Citations
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
        {feedback.criterionEvaluations.map((ce) => (
          <div key={ce.criterionId} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{ce.criterionName}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  {ce.score} / {ce.maxScore}
                </span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div style={{
              height: '4px',
              background: '#18181b',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '14px',
            }}>
              <div style={{
                height: '100%',
                width: `${ce.score}%`,
                background: ce.score >= 80 ? '#10b981' : ce.score >= 60 ? '#3b82f6' : '#f59e0b',
                transition: 'width 0.6s ease',
              }} />
            </div>

            <div style={{ fontSize: '0.88rem', color: '#f4f4f5', marginBottom: '8px' }}>
              <strong>Evidence Citation:</strong> {ce.evidence}
            </div>

            {ce.concern && (
              <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '8px' }}>
                ⚠️ <strong>Concern:</strong> {ce.concern}
              </div>
            )}

            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              💡 <strong>Actionable Suggestion:</strong> {ce.suggestion}
            </div>
          </div>
        ))}
      </div>

      {/* Extensibility Stress Test Feedback */}
      {feedback.extensibilityAnalysis && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '36px', background: '#000000', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#ffffff' }}>
            <Lightbulb size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Extensibility Stress-Test Feedback</h3>
          </div>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {feedback.extensibilityAnalysis}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <button onClick={onTryAgain} className="btn-primary" style={{ padding: '12px 28px' }}>
          <RefreshCw size={16} />
          <span>Iterate & Try Again (Version #{attemptNumber + 1})</span>
        </button>

        <button onClick={onViewHistory} className="btn-secondary" style={{ padding: '12px 24px' }}>
          <Layers size={16} />
          <span>View Attempt History & Progression</span>
        </button>
      </div>
    </div>
  );
};
