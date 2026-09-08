import React from 'react';
import { Layers, History, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'studio' | 'feedback' | 'history';
  onNavigate: (view: 'catalog' | 'studio' | 'feedback' | 'history') => void;
  selectedProblemTitle?: string;
  attemptCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedProblemTitle,
  attemptCount,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid #27272a',
      background: '#000000',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand & Logo */}
      <div 
        onClick={() => onNavigate('catalog')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Layers size={20} color="#000000" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            LLD Studio
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#71717a' }}>
            Object-Oriented Practice & AI Feedback
          </p>
        </div>
      </div>

      {/* Breadcrumb Context */}
      {selectedProblemTitle && currentView !== 'catalog' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#18181b',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #27272a',
          fontSize: '0.82rem',
          color: '#f4f4f5'
        }}>
          <BookOpen size={14} color="#a1a1aa" />
          <span>{selectedProblemTitle}</span>
        </div>
      )}

      {/* Action Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onNavigate('catalog')}
          className={currentView === 'catalog' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Layers size={16} />
          <span>Problems</span>
        </button>

        {selectedProblemTitle && (
          <>
            <button
              onClick={() => onNavigate('studio')}
              className={currentView === 'studio' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem' }}
            >
              <Sparkles size={16} />
              <span>Studio Workspace</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={currentView === 'history' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', position: 'relative' }}
            >
              <History size={16} />
              <span>Attempt History</span>
              {attemptCount > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  marginLeft: '4px'
                }}>
                  {attemptCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
