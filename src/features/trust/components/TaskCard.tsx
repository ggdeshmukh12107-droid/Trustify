import { truncateAddress, formatTimeRemaining, formatXLM } from '../../../utils/stellar';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { TrustTask } from '../../../types';

interface TaskCardProps {
    task: TrustTask;
    onEndorse: (task: TrustTask) => void;
    isConnected: boolean;
    isLoading?: boolean;
}

export function TaskCard({ task, onEndorse, isConnected, isLoading }: TaskCardProps) {
    const { title, description, freelancer, targetScore, trustScore, deadline, endorsements } = task;
    const isEnded = deadline < Date.now();
    const isTrusted = trustScore >= targetScore;

    return (
        <article className={`task-card ${isLoading ? 'card-loading' : ''}`}>
            {isLoading && (
                <div className="card-loading-overlay">
                    <LoadingSpinner size="md" label="Processing Endorsement..." />
                </div>
            )}
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <span className={`card-badge ${isEnded ? 'badge-ended' : isTrusted ? 'badge-trusted' : 'badge-active'}`}>
                    {isEnded ? 'Closed' : isTrusted ? 'Verified Trust' : 'Pending Verification'}
                </span>
            </div>
            <p className="card-description">{description}</p>
            <div className="card-meta">
                <span className="card-creator" title={freelancer}>
                    Job by {truncateAddress(freelancer, 5)}
                </span>
                <span className={`card-deadline ${isEnded ? 'deadline-over' : ''}`}>
                    🕐 {formatTimeRemaining(deadline)}
                </span>
            </div>
            <ProgressBar raised={trustScore} goal={targetScore} showMilestones animated label="Trust Score" />
            <div className="card-footer">
                <div className="card-stats">
                    <span className="stat">
                        <strong>{endorsements.length}</strong>
                        <small>Endorsements</small>
                    </span>
                    <span className="stat">
                        <strong>{formatXLM(trustScore)}</strong>
                        <small>Trust Pts</small>
                    </span>
                </div>
                <button
                    id={`endorse-btn-${task.id}`}
                    className="btn btn-primary btn-endorse"
                    onClick={() => onEndorse(task)}
                    disabled={!isConnected || isEnded}
                    title={!isConnected ? 'Connect wallet to endorse' : isEnded ? 'Task verification ended' : `Endorse ${title}`}
                >
                    {!isConnected ? '🔒 Connect to Endorse' : 'Verify & Endorse'}
                </button>
            </div>
        </article>
    );
}

export default TaskCard;
