import { truncateAddress } from '../../../utils/stellar';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { WalletState } from '../../../types';

interface WalletConnectProps {
    walletState: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
}

export function WalletConnect({ walletState, onConnect, onDisconnect }: WalletConnectProps) {
    const { isConnected, publicKey, network, isLoading, error } = walletState;

    if (isLoading) {
        return (
            <div className="wallet-btn wallet-loading">
                <LoadingSpinner size="sm" />
                <span>Connecting…</span>
            </div>
        );
    }

    if (isConnected && publicKey) {
        return (
            <div className="wallet-connected-wrap">
                <div className="wallet-info">
                    <span className={`network-badge ${network}`}>{network}</span>
                    <span className="wallet-address">{truncateAddress(publicKey, 5)}</span>
                </div>
                <button
                    id="disconnect-wallet-btn"
                    className="btn btn-outline btn-sm"
                    onClick={onDisconnect}
                    title="Disconnect wallet"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-disconnect-wrap">
            {error && (
                <span className="wallet-error-tooltip" title={error}>
                    ⚠ {error.length > 48 ? error.slice(0, 48) + '…' : error}
                </span>
            )}
            <button
                id="connect-wallet-btn"
                className="btn btn-primary"
                onClick={onConnect}
            >
                Connect Wallet
            </button>
        </div>
    );
}

export default WalletConnect;
