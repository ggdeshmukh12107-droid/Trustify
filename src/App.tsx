import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TaskCard } from './features/trust/components/TaskCard';
import { CreateTaskModal } from './features/trust/components/CreateTaskModal';
import { EndorseModal } from './features/trust/components/EndorseModal';
import { ActivityFeed } from './features/trust/components/ActivityFeed';
import { UserProfile } from './features/trust/components/UserProfile';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useWallet } from './features/wallet/hooks/useWallet';
import { useTrustSystem } from './features/trust/hooks/useTrustSystem';
import type { TrustTask, CreateTaskInput, Toast } from './types';
import { generateId } from './utils/stellar';
import './App.css';

function App() {
  const wallet = useWallet();
  const { tasks, isLoading, createTask, endorseTask, allEndorsements } = useTrustSystem();
  const [showCreate, setShowCreate] = useState(false);
  const [endorsingTask, setEndorsingTask] = useState<TrustTask | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      await createTask(input, wallet.publicKey || 'ANONYMOUS');
      setShowCreate(false);
      addToast('🚀 Trust Task registered successfully!', 'success');
    } catch {
      addToast('Failed to register task. Please try again.', 'error');
    }
  };

  const handleEndorse = async (amount: number) => {
    if (!endorsingTask) return;
    setLoadingTaskId(endorsingTask.id);
    try {
      await endorseTask(
        { taskId: endorsingTask.id, amount },
        wallet.publicKey || 'Anonymous',
        wallet.isConnected ? wallet.signTransaction : undefined
      );
      addToast(`✅ Trust Endorsed! ${amount} XLM recorded on Stellar blockchain.`, 'success');
      setEndorsingTask(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      addToast(`❌ ${msg}`, 'error');
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="app">
      <Header
        walletState={wallet}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onCreateTask={() => setShowCreate(true)}
      />

      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <h1 className="hero-title">
              Build Verifiable Trust on<br />
              <span className="gradient-text">Stellar</span>
            </h1>
            <p className="hero-sub">
              A blockchain-based reputation protocol for freelancers and marketplaces.
              Earn permanent trust scores transparently, fast, and borderless.
            </p>
            <div className="hero-actions">
              {!wallet.isConnected ? (
                <button id="hero-connect-btn" className="btn btn-primary btn-lg btn-glow" onClick={wallet.connect}>
                  Connect Wallet →
                </button>
              ) : (
                <button id="hero-create-btn" className="btn btn-primary btn-lg btn-glow" onClick={() => setShowCreate(true)}>
                  + Request Validation
                </button>
              )}
              <a href="#tasks" className="btn btn-outline btn-lg">Explore verified tasks</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{tasks.length}</strong>
                <small>Tasks Completed</small>
              </div>
              <div className="hero-stat">
                <strong>{allEndorsements.length}</strong>
                <small>Trust Verifications</small>
              </div>
              <div className="hero-stat">
                <strong>
                  {tasks.reduce((s, t) => s + t.trustScore, 0).toFixed(0)} Pts
                </strong>
                <small>Network Trust Score</small>
              </div>
            </div>
          </div>
          <div className="hero-glow" aria-hidden="true" />
        </section>

        {/* User Profile — shown only when wallet is connected */}
        {wallet.isConnected && wallet.publicKey && (
          <UserProfile publicKey={wallet.publicKey} tasks={tasks} />
        )}

        {/* Tasks Grid */}
        <section className="campaigns-section" id="tasks">
          <div className="section-header">
            <h2 className="section-title">Marketplace Tasks</h2>
            {isLoading && <LoadingSpinner size="sm" label="Syncing network..." />}
          </div>
          {isLoading && tasks.length === 0 ? (
            <div className="full-loader">
              <LoadingSpinner size="lg" label="Loading tasks..." />
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌟</div>
              <p>No tasks registered yet. Be the first to build your reputation!</p>
            </div>
          ) : (
            <div className="campaign-grid">
              {tasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEndorse={setEndorsingTask}
                  isConnected={wallet.isConnected}
                  isLoading={loadingTaskId === t.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Activity Feed */}
        <ActivityFeed endorsements={allEndorsements} />
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreate}
        isLoading={isLoading}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateTask}
      />
      <EndorseModal
        task={endorsingTask}
        isOpen={!!endorsingTask}
        isLoading={loadingTaskId !== null}
        onClose={() => setEndorsingTask(null)}
        onEndorse={handleEndorse}
      />

      {/* Toast Notifications */}
      <div className="toast-container" role="alert" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
