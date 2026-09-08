import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProblemCatalog } from './components/ProblemCatalog';
import { PracticeStudio } from './components/PracticeStudio';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { AttemptHistoryModal } from './components/AttemptHistoryModal';
import { Problem, Attempt, Submission } from './types';
import { Cpu } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

export function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentView, setCurrentView] = useState<'catalog' | 'studio' | 'feedback' | 'history'>('catalog');

  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [attemptsMap, setAttemptsMap] = useState<Record<string, Attempt[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStep, setEvaluationStep] = useState<string>('Validating structural completeness & entity signatures...');

  // Fetch problems on mount
  useEffect(() => {
    fetch(`${API_BASE}/problems`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblems(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch problems:', err));
  }, []);

  // Fetch history when problem is selected
  const fetchProblemHistory = async (problemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/problems/${problemId}/attempts`);
      const data = await res.json();
      if (data.success) {
        setAttemptsMap((prev) => ({ ...prev, [problemId]: data.data }));
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    fetchProblemHistory(problem.id);
    setCurrentView('studio');
  };

  const handleSubmitSolution = async (submission: Submission) => {
    if (!selectedProblem) return;
    setIsSubmitting(true);
    setIsEvaluating(true);
    setEvaluationStep('Validating structural completeness & entity signatures...');

    try {
      const response = await fetch(`${API_BASE}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          ...submission,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        alert(`Submission Error: ${result.error}`);
        setIsSubmitting(false);
        setIsEvaluating(false);
        return;
      }

      const submittedAttempt: Attempt = result.data;
      setCurrentAttempt(submittedAttempt);

      // Start Polling Async Evaluation Status
      pollEvaluationStatus(submittedAttempt.id);
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
      setIsSubmitting(false);
      setIsEvaluating(false);
    }
  };

  const pollEvaluationStatus = (attemptId: string) => {
    let steps = [
      'Validating structural completeness & entity signatures...',
      'Executing LLM architectural reasoning engine against 6 rubric axes...',
      'Synthesizing evidence citations and extensibility feedback...'
    ];
    let stepIdx = 0;

    const interval = setInterval(async () => {
      stepIdx = (stepIdx + 1) % steps.length;
      setEvaluationStep(steps[stepIdx]);

      try {
        const res = await fetch(`${API_BASE}/attempts/${attemptId}`);
        const data = await res.json();

        if (data.success && data.data) {
          const updatedAttempt: Attempt = data.data;

          if (updatedAttempt.status === 'COMPLETED' || updatedAttempt.status === 'FAILED') {
            clearInterval(interval);
            setCurrentAttempt(updatedAttempt);
            setIsSubmitting(false);
            setIsEvaluating(false);
            setCurrentView('feedback');

            if (selectedProblem) {
              fetchProblemHistory(selectedProblem.id);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 700);
  };

  const activeProblemAttempts = selectedProblem ? attemptsMap[selectedProblem.id] || [] : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        selectedProblemTitle={selectedProblem?.title}
        attemptCount={activeProblemAttempts.length}
      />

      {/* Async Evaluation Banner Overlay */}
      {isEvaluating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="glass-card evaluating-pulse" style={{
            padding: '40px 60px',
            textAlign: 'center',
            maxWidth: '520px',
            border: '1px solid var(--border-accent)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            }}>
              <Cpu size={32} color="#fff" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>
              Evaluating LLD Architecture
            </h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 600 }}>
              {evaluationStep}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Combining deterministic rule-checks with AI architectural reasoning...
            </div>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'catalog' && (
          <ProblemCatalog
            problems={problems}
            onSelectProblem={handleSelectProblem}
            attemptsMap={Object.fromEntries(
              Object.entries(attemptsMap).map(([k, v]) => [k, v.length])
            )}
          />
        )}

        {currentView === 'studio' && selectedProblem && (
          <PracticeStudio
            problem={selectedProblem}
            onSubmit={handleSubmitSolution}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'feedback' && selectedProblem && currentAttempt?.feedbackReport && (
          <FeedbackDashboard
            problem={selectedProblem}
            feedback={currentAttempt.feedbackReport}
            attemptNumber={currentAttempt.attemptNumber}
            onTryAgain={() => setCurrentView('studio')}
            onViewHistory={() => setCurrentView('history')}
          />
        )}

        {currentView === 'history' && selectedProblem && (
          <AttemptHistoryModal
            problem={selectedProblem}
            attempts={activeProblemAttempts}
            onClose={() => setCurrentView('feedback')}
            onSelectAttempt={(attempt) => {
              setCurrentAttempt(attempt);
              setCurrentView('feedback');
            }}
          />
        )}
      </main>
    </div>
  );
}
