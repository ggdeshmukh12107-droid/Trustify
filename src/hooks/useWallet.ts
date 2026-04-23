import { useState, useCallback } from 'react';
import {
    requestAccess,
    getAddress,
    getNetwork,
    signTransaction as freighterSignTransaction,
    isConnected as checkIsConnected
} from '@stellar/freighter-api';
import type { WalletState } from '../types';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

const initialState: WalletState = {
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: false,
    error: null,
};

export function useWallet() {
    const [walletState, setWalletState] = useState<WalletState>(initialState);

    const connect = useCallback(async () => {
        setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Freighter detection - isConnected() is the most reliable method
            const isInstalled = await checkIsConnected();

            if (!isInstalled) {
                // Sometimes detection fails on first try if the extension is slow to load
                // We'll throw a clearer error and check for window.freighter as a fallback
                const hasFreighterGlobal = typeof window !== 'undefined' && !!(window as any).freighter;
                if (!hasFreighterGlobal) {
                    throw new Error("Freighter extension not found. Please install it, ensure it's enabled, and refresh the page.");
                }
            }

            let address = '';

            // In v6, requestAccess() is the preferred way to trigger the approval popup
            try {
                const result = await requestAccess();
                if (typeof result === 'string') {
                    address = result;
                } else if (result && result.address) {
                    address = result.address;
                } else if (result && (result as any).error) {
                    throw new Error(String((result as any).error));
                }
            } catch (e) {
                // Fallback to getAddress if requestAccess fails/isn't what we expect
                const silent = await getAddress();
                if (typeof silent === 'string') {
                    address = silent;
                } else if (silent && silent.address) {
                    address = silent.address;
                }
            }

            if (!address) {
                // Final attempt - getAddress often works after a failed requestAccess
                const finalTry = await getAddress();
                address = typeof finalTry === 'string' ? finalTry : (finalTry?.address || '');
            }

            if (!address) {
                throw new Error(
                    'Could not retrieve your wallet address. ' +
                    'Please make sure your Freighter wallet is unlocked and approved for this site.'
                );
            }

            // Get network details
            const netResult = await getNetwork();
            const networkPassphrase = typeof netResult === 'string' ? netResult : (netResult?.networkPassphrase || '');
            const network = networkPassphrase === TESTNET_PASSPHRASE ? 'testnet' : 'mainnet';

            setWalletState({
                isConnected: true,
                publicKey: address,
                network,
                isLoading: false,
                error: null,
            });
        } catch (err) {
            const raw = err instanceof Error ? err.message : String(err);
            let message = raw;

            if (/reject|denied|cancel|User declined/i.test(raw)) {
                message = 'Connection rejected. Please approve the connection in Freighter and try again.';
            } else if (/locked|unlock/i.test(raw)) {
                message = 'Freighter is locked. Please open and unlock your wallet first.';
            } else if (/not installed|not found|not detected/i.test(raw)) {
                message = 'Freighter extension not found. Please install it and refresh the page.';
            }

            setWalletState(prev => ({
                ...prev,
                isConnected: false,
                publicKey: null,
                network: null,
                isLoading: false,
                error: message,
            }));
        }
    }, [checkIsConnected, requestAccess, getAddress, getNetwork]);

    const disconnect = useCallback(() => {
        setWalletState(initialState);
    }, []);

    const signTransaction = useCallback(
        async (xdr: string): Promise<string> => {
            if (!walletState.isConnected) throw new Error('Wallet not connected');

            // Freighter v6 returns { signedTxXdr: string, error?: string }
            const result = await freighterSignTransaction(xdr, {
                networkPassphrase: TESTNET_PASSPHRASE,
            }) as unknown as { signedTxXdr?: string; error?: string } | string;

            // Handle both: object response (v6) and plain string response (older)
            if (typeof result === 'string') {
                if (!result) throw new Error('Freighter returned empty response. Did you approve the transaction?');
                return result;
            }

            if (result.error) {
                const errMsg = String(result.error);
                if (/reject|denied|cancel|decline/i.test(errMsg)) {
                    throw new Error('Transaction rejected. Please approve it in Freighter to record your trust endorsement.');
                }
                throw new Error(`Freighter error: ${errMsg}`);
            }

            if (!result.signedTxXdr) {
                throw new Error('Freighter did not return a signed transaction. Please try again.');
            }

            return result.signedTxXdr;
        },
        [walletState.isConnected]
    );

    return {
        ...walletState,
        connect,
        disconnect,
        signTransaction,
    };
}
