import { truncateAddress } from '../../../utils/stellar';
import type { TrustTask } from '../../../types';

interface UserProfileProps {
    publicKey: string;
    tasks: TrustTask[];
}

const SCORE_RULES = [
    { icon: '✅', label: 'Task Completed',        points: '+10', color: 'var(--green)' },
    { icon: '💸', label: 'Successful Transaction', points: '+5',  color: 'var(--green)' },
    { icon: '🤝', label: 'Peer Endorsement',       points: '+3',  color: 'var(--purple-light)' },
    { icon: '👎', label: 'Negative Feedback',      points: '-5',  color: 'var(--red)' },
    { icon: '⚠️', label: 'Missed Deadline',        points: '-3',  color: 'var(--red)' },
];

function getTrustLevel(score: number): { label: string; color: string; icon: string } {
    if (score >= 100) return { label: 'Elite',    color: '#f59e0b', icon: '🏆' };
    if (score >= 50)  return { label: 'Trusted',  color: '#10b981', icon: '⭐' };
    if (score >= 20)  return { label: 'Growing',  color: '#6366f1', icon: '📈' };
    return                  { label: 'Newcomer', color: '#9595b5', icon: '🌱' };
}

export function UserProfile({ publicKey, tasks }: UserProfileProps) {
    // Calculate this user's stats from their tasks
    const myTasks = tasks.filter(t => t.freelancer === publicKey);
    const myEndorsements = tasks.flatMap(t => t.endorsements.filter(e => e.client === publicKey));

    // Score: +10 per task created, +5 per endorsement given, +3 per endorsement received
    const taskScore      = myTasks.length * 10;
    const endorsedScore  = myEndorsements.length * 5;
    const receivedScore  = myTasks.reduce((sum, t) => sum + t.endorsements.length * 3, 0);
    const totalScore     = taskScore + endorsedScore + receivedScore;

    const level = getTrustLevel(totalScore);

    return (
        <section className="user-profile-panel glass-panel" id="profile">
            <div className="profile-header">
                <div className="profile-avatar" style={{ borderColor: level.color }}>
                    <span className="profile-avatar-icon">{level.icon}</span>
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">My Trust Profile</h2>
                    <code className="profile-address">{truncateAddress(publicKey, 8)}</code>
                    <span className="profile-level-badge" style={{ background: `${level.color}22`, color: level.color, border: `1px solid ${level.color}55` }}>
                        {level.label}
                    </span>
                </div>
                <div className="profile-total-score">
                    <span className="score-number">{totalScore}</span>
                    <span className="score-label">Trust Points</span>
                </div>
            </div>

            <div className="profile-stats-row">
                <div className="profile-stat-box">
                    <strong>{myTasks.length}</strong>
                    <small>Tasks Registered</small>
                </div>
                <div className="profile-stat-box">
                    <strong>{myEndorsements.length}</strong>
                    <small>Tasks Endorsed</small>
                </div>
                <div className="profile-stat-box">
                    <strong>{myTasks.reduce((s, t) => s + t.endorsements.length, 0)}</strong>
                    <small>Times Endorsed</small>
                </div>
                <div className="profile-stat-box">
                    <strong style={{ color: 'var(--green)' }}>+{taskScore}</strong>
                    <small>From Tasks</small>
                </div>
            </div>

            <div className="score-rulebook">
                <h3 className="rulebook-title">⚡ How Your Score is Calculated</h3>
                <ul className="rulebook-list">
                    {SCORE_RULES.map(rule => (
                        <li key={rule.label} className="rulebook-item">
                            <span className="rule-icon">{rule.icon}</span>
                            <span className="rule-label">{rule.label}</span>
                            <span className="rule-points" style={{ color: rule.color }}>{rule.points} pts</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default UserProfile;
