import { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { CreateTaskInput } from '../../../types';

interface CreateTaskProps {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onSubmit: (input: CreateTaskInput) => Promise<void>;
}

const getMinDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
};

export function CreateTaskModal({ isOpen, isLoading, onClose, onSubmit }: CreateTaskProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetScore, setTargetScore] = useState('');
    const [deadline, setDeadline] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!title.trim() || title.length < 5) e.title = 'Title must be at least 5 characters.';
        if (!description.trim() || description.length < 20) e.description = 'Description must be at least 20 characters.';
        const goalNum = parseFloat(targetScore);
        if (isNaN(goalNum) || goalNum < 5) e.targetScore = 'Target score must be at least 5 points.';
        if (!deadline) e.deadline = 'Please select a deadline.';
        else if (new Date(deadline) <= new Date()) e.deadline = 'Deadline must be in the future.';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        await onSubmit({ title, description, targetScore: parseFloat(targetScore), deadline: new Date(deadline) });
        setTitle(''); setDescription(''); setTargetScore(''); setDeadline('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">🌟 Add Trust Task</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="task-title">Task Title</label>
                        <input
                            id="task-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Smart Contract Audit"
                            disabled={isLoading}
                            maxLength={100}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="task-desc">Task Verification Description</label>
                        <textarea
                            id="task-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the job you completed to earn this trust score..."
                            rows={3}
                            disabled={isLoading}
                            maxLength={500}
                        />
                        {errors.description && <span className="field-error">{errors.description}</span>}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="task-score">Target Trust Score</label>
                            <input
                                id="task-score"
                                type="number"
                                value={targetScore}
                                onChange={e => setTargetScore(e.target.value)}
                                placeholder="e.g. 50"
                                min="5"
                                step="1"
                                disabled={isLoading}
                            />
                            {errors.targetScore && <span className="field-error">{errors.targetScore}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="task-deadline">Verification Deadline</label>
                            <input
                                id="task-deadline"
                                type="datetime-local"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                min={getMinDeadline()}
                                disabled={isLoading}
                            />
                            {errors.deadline && <span className="field-error">{errors.deadline}</span>}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" id="submit-task-btn" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? <LoadingSpinner size="sm" /> : 'Request Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTaskModal;
