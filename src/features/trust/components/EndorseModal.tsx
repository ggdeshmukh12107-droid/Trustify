import { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatXLM } from '../../../utils/stellar';
import type { TrustTask } from '../../../types';

interface EndorseModalProps {
    task: TrustTask | null;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onEndorse: (amount: number) => Promise<void>;
}

export function EndorseModal({ task, isOpen, isLoading, onClose, onEndorse }: EndorseModalProps) {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
    const [error, setError] = useState('');

    if (!isOpen || !task) return null;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val < 1) { setError('Minimum endorsement is 1 Trust Point (XLM).'); return; }
        setError('');
        setStep('confirm');
    };

    const handleConfirm = async () => {
        try {
            await onEndorse(parseFloat(amount));
            setStep('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed.');
            setStep('input');
        }
    };

    const handleClose = () => {
        setAmount('');
        setStep('input');
        setError('');
        onClose();
    };

    const QUICK_AMOUNTS = [10, 25, 50, 100];

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-box modal-sm glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">🏅 Verify & Endorse Trust</h2>
                    <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
                </div>

                {step === 'success' ? (
                    <div className="donate-success">
                        <div className="success-icon">🎉</div>
                        <h3>Trust Verified!</h3>
                        <p>You have successfully endorsed <strong>{formatXLM(parseFloat(amount))} Trust Points</strong> to <em>{task.title}</em>.</p>
                        <button className="btn btn-primary" onClick={handleClose}>Done</button>
                    </div>
                ) : step === 'confirm' ? (
                    <div className="donate-confirm">
                        <p className="confirm-text">
                            You are about to issue <strong>{formatXLM(parseFloat(amount))} Trust Points</strong> for:
                        </p>
                        <div className="confirm-campaign">{task.title}</div>
                        {error && <p className="field-error">{error}</p>}
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setStep('input')} disabled={isLoading}>Back</button>
                            <button
                                id="confirm-endorse-btn"
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? <LoadingSpinner size="sm" /> : 'Confirm Validation'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className="modal-form donate-form" onSubmit={handleNext}>
                        <div className="donate-campaign-info">
                            <span className="donate-label">Task:</span>
                            <span className="donate-campaign-name">{task.title}</span>
                        </div>
                        <div className="quick-amounts">
                            {QUICK_AMOUNTS.map(q => (
                                <button
                                    key={q}
                                    type="button"
                                    className={`quick-amount-btn ${amount === String(q) ? 'selected' : ''}`}
                                    onClick={() => setAmount(String(q))}
                                >
                                    {q} Pts
                                </button>
                            ))}
                        </div>
                        <div className="form-group">
                            <label htmlFor="endorse-amount">Custom Trust Points (XLM)</label>
                            <input
                                id="endorse-amount"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Enter points..."
                                min="1"
                                step="1"
                                disabled={isLoading}
                            />
                            {error && <span className="field-error">{error}</span>}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-outline" onClick={handleClose}>Cancel</button>
                            <button type="submit" id="next-endorse-btn" className="btn btn-primary" disabled={isLoading}>
                                Next →
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EndorseModal;
