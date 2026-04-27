import { WalletConnect } from '../../features/wallet/components/WalletConnect';
import type { WalletState } from '../../types';

interface HeaderProps {
    walletState: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
    onCreateTask: () => void;
}

export function Header({ walletState, onConnect, onDisconnect, onCreateTask }: HeaderProps) {
    return (
        <header className="header glass-panel">
            <div className="header-inner">
                <div className="header-logo">
                    <div className="logo-icon">🛡️</div>
                    <div className="logo-text">
                        <span className="logo-name">Trustify</span>
                        <span className="logo-sub">Reputation Protocol</span>
                    </div>
                </div>
                <nav className="header-nav">
                    <a href="#tasks" className="nav-link">Marketplace Tasks</a>
                    <a href="#activity" className="nav-link">Network Activity</a>
                    {walletState.isConnected && (
                        <button
                            id="create-task-btn"
                            className="btn btn-secondary btn-sm"
                            onClick={onCreateTask}
                        >
                            + Request Trust Validation
                        </button>
                    )}
                </nav>
                <WalletConnect
                    walletState={walletState}
                    onConnect={onConnect}
                    onDisconnect={onDisconnect}
                />
            </div>
        </header>
    );
}

export default Header;
