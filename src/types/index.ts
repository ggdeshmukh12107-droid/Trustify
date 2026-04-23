// Core TypeScript interfaces for the Stellar Trust Score Economy DApp

export interface TrustTask {
    id: string;
    title: string;
    description: string;
    freelancer: string; // Stellar public key
    targetScore: number; // in XLM
    trustScore: number; // in XLM
    deadline: number; // Unix timestamp
    createdAt: number; // Unix timestamp
    endorsements: TrustEndorsement[];
}

export interface TrustEndorsement {
    id: string;
    taskId: string;
    client: string; // Stellar public key
    amount: number; // in XLM
    timestamp: number; // Unix timestamp
    txHash?: string; // Stellar transaction hash
}

export interface WalletState {
    isConnected: boolean;
    publicKey: string | null;
    network: 'testnet' | 'mainnet' | null;
    isLoading: boolean;
    error: string | null;
}

export interface CacheEntry<T> {
    data: T;
    expiresAt: number; // Unix timestamp ms
}

export interface CreateTaskInput {
    title: string;
    description: string;
    targetScore: number; // in XLM
    deadline: Date;
}

export interface EndorseInput {
    taskId: string;
    amount: number; // in XLM
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
