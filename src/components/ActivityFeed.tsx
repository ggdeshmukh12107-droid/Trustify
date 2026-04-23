import { truncateAddress, formatXLM } from '../utils/stellar';

interface TrustEndorsementFeedItem {
    id: string;
    taskId: string;
    client: string;
    amount: number;
    timestamp: number;
    txHash?: string;
    taskTitle: string;
}

interface ActivityFeedProps {
    endorsements: TrustEndorsementFeedItem[];
}

function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function clientColor(client: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const idx = client.charCodeAt(0) % colors.length;
    return colors[idx];
}

export function ActivityFeed({ endorsements }: ActivityFeedProps) {
    return (
        <section className="activity-feed" id="activity">
            <h2 className="section-title">📡 Live Trust Verifications</h2>
            {endorsements.length === 0 ? (
                <div className="empty-feed">No trust endorsements yet. Be the first to verify a task!</div>
            ) : (
                <ul className="feed-list">
                    {endorsements.map((e, i) => (
                        <li
                            key={e.id}
                            className="feed-item"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div
                                className="feed-avatar"
                                style={{ background: `linear-gradient(135deg, ${clientColor(e.client)}, ${clientColor(e.client + '1')})` }}
                                aria-hidden="true"
                            >
                                {e.client.charAt(0)}
                            </div>
                            <div className="feed-content">
                                <div className="feed-donor">
                                    <span className="donor-name">{truncateAddress(e.client, 4)} verified</span>
                                    <span className="feed-amount">+{formatXLM(e.amount)} Pts</span>
                                </div>
                                <div className="feed-campaign">→ {e.taskTitle}</div>
                                {e.txHash && (
                                    <div className="feed-tx" title={e.txHash}>
                                        TX: {truncateAddress(e.txHash, 6)}
                                    </div>
                                )}
                            </div>
                            <time className="feed-time" dateTime={new Date(e.timestamp).toISOString()}>
                                {timeAgo(e.timestamp)}
                            </time>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ActivityFeed;
