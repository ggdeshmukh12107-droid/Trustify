import { formatXLM } from '../../utils/stellar';

interface ProgressBarProps {
    raised: number;
    goal: number;
    showLabels?: boolean;
    showMilestones?: boolean;
    animated?: boolean;
    label?: string;
}

const MILESTONES = [25, 50, 75, 100];

export function ProgressBar({
    raised,
    goal,
    showLabels = true,
    showMilestones = true,
    animated = true,
    label = 'Progress'
}: ProgressBarProps) {
    const raw = goal > 0 ? (raised / goal) * 100 : 0;
    const percentage = Math.min(100, Math.max(0, raw));

    const colorClass =
        percentage >= 100 ? 'progress-full' :
            percentage >= 75 ? 'progress-high' :
                percentage >= 50 ? 'progress-mid' :
                    'progress-low';

    return (
        <div className="progress-bar-container" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            {showLabels && (
                <div className="progress-labels">
                    <span className="progress-raised">{formatXLM(raised)} {label} Verified</span>
                    <span className="progress-pct">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="progress-track">
                <div
                    className={`progress-fill ${colorClass} ${animated ? 'progress-animated' : ''}`}
                    style={{ width: `${percentage}%` }}
                />
                {showMilestones && MILESTONES.map(m => (
                    <div
                        key={m}
                        className={`progress-milestone ${percentage >= m ? 'milestone-reached' : ''}`}
                        style={{ left: `${m}%` }}
                        title={`${m}%`}
                    />
                ))}
            </div>
            {showLabels && (
                <div className="progress-goal">
                    Target: {formatXLM(goal)} Pts
                </div>
            )}
        </div>
    );
}

export default ProgressBar;
