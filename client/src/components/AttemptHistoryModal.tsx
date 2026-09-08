import React, { useState } from 'react';
import { Attempt, Problem } from '../types';
import { History, ArrowRight, ShieldCheck, Code2, ArrowUpRight, X } from 'lucide-react';

interface AttemptHistoryModalProps {
  problem: Problem;
  attempts: Attempt[];
  onClose: () => void;
  onSelectAttempt: (attempt: Attempt) => void;
}

export const AttemptHistoryModal: React.FC<AttemptHistoryModalProps> = ({
  problem,
  attempts,
  onClose,
  onSelectAttempt,
}) => {
  const [compareIdA, setCompareIdA] = useState<string | null>(attempts[0]?.id || null);
  const [compareIdB, setCompareIdB] = useState<string | null>(attempts[1]?.id || attempts[0]?.id || null);
  const [isCompareView, setIsCompareView] = useState<boolean>(false);

  const attemptA = attempts.find((a) => a.id === compareIdA);
  const attemptB = attempts.find((a) => a.id === compareIdB);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: isCompareView ? '1200px' : '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-accent)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 20, 32, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Attempt Progression History
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {problem.title} ({attempts.length} Total Attempt{attempts.length > 1 ? 's' : ''})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {attempts.length >= 2 && (
              <button
                onClick={() => setIsCompareView(!isCompareView)}
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                {isCompareView ? 'Back to Timeline' : 'Compare Attempts Side-by-Side'}
              </button>
            )}

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {!isCompareView ? (
            /* Timeline View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {attempts.map((att) => {
                const score = att.feedbackReport?.overallScore ?? 0;
                return (
                  <div
                    key={att.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectAttempt(att)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: 'var(--primary)',
                      }}>
                        #{att.attemptNumber}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                            Attempt #{att.attemptNumber}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: att.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: att.status === 'COMPLETED' ? 'var(--grade-excellent)' : 'var(--grade-needs)',
                          }}>
                            {att.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Submitted on {new Date(att.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      {att.feedbackReport && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
                            {score}/100
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {att.feedbackReport.grade}
                          </div>
                        </div>
                      )}

                      <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                        <span>View Feedback</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Side-by-side Compare View */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Select Attempt A:
                  </label>
                  <select
                    className="glass-input"
                    value={compareIdA || ''}
                    onChange={(e) => setCompareIdA(e.target.value)}
                  >
                    {attempts.map((a) => (
                      <option key={a.id} value={a.id}>
                        Attempt #{a.attemptNumber} (Score: {a.feedbackReport?.overallScore || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Select Attempt B:
                  </label>
                  <select
                    className="glass-input"
                    value={compareIdB || ''}
                    onChange={(e) => setCompareIdB(e.target.value)}
                  >
                    {attempts.map((a) => (
                      <option key={a.id} value={a.id}>
                        Attempt #{a.attemptNumber} (Score: {a.feedbackReport?.overallScore || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {attemptA && attemptB && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Left Column Attempt A */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ fontWeight: 700 }}>Attempt #{attemptA.attemptNumber}</h4>
                      <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>
                        Score: {attemptA.feedbackReport?.overallScore || 0}/100
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
                      {attemptA.feedbackReport?.summary}
                    </div>

                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Code Snapshot:</h5>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      background: 'rgba(0,0,0,0.5)',
                      padding: '12px',
                      borderRadius: '8px',
                      maxHeight: '300px',
                      overflow: 'auto',
                    }}>
                      {attemptA.submission.code || attemptA.submission.designExplanation}
                    </pre>
                  </div>

                  {/* Right Column Attempt B */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ fontWeight: 700 }}>Attempt #{attemptB.attemptNumber}</h4>
                      <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>
                        Score: {attemptB.feedbackReport?.overallScore || 0}/100
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
                      {attemptB.feedbackReport?.summary}
                    </div>

                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Code Snapshot:</h5>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      background: 'rgba(0,0,0,0.5)',
                      padding: '12px',
                      borderRadius: '8px',
                      maxHeight: '300px',
                      overflow: 'auto',
                    }}>
                      {attemptB.submission.code || attemptB.submission.designExplanation}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
