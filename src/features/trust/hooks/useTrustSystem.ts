import { useState, useCallback, useEffect } from 'react';
import type { TrustTask, TrustEndorsement, CreateTaskInput, EndorseInput } from '../../../types';
import { cache } from '../../../utils/cache';
import { generateId, formatXLM } from '../../../utils/stellar';
import { buildAndSubmitDonationTx, ensureFunded } from '../../../services/stellar.service';

const CACHE_KEY_TASKS = 'trust_tasks';
const CACHE_TTL = 30_000; // 30 seconds
const STORAGE_KEY = 'stellar_trust_tasks';

// Seed data for demonstration
const SEED_TASKS: TrustTask[] = [
    {
        id: 'seed-1',
        title: 'Smart Contract Audit',
        description: 'Successfully audited the DeFi governance contracts and resolved 3 critical vulnerabilities.',
        freelancer: 'GAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLM',
        targetScore: 50,
        trustScore: 45,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, 
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        endorsements: [
            { id: 'e1', taskId: 'seed-1', client: 'GBPQ...RK2A', amount: 20, timestamp: Date.now() - 60 * 60 * 1000 },
            { id: 'e2', taskId: 'seed-1', client: 'GD5Z...MN9X', amount: 25, timestamp: Date.now() - 2 * 60 * 60 * 1000 },
        ],
    },
    {
        id: 'seed-2',
        title: 'Frontend DApp Integration',
        description: 'Built and integrated the Stellar wallet functionalities for the new NFT marketplace MVP.',
        freelancer: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
        targetScore: 25,
        trustScore: 8,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, 
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        endorsements: [
            { id: 'e3', taskId: 'seed-2', client: 'GBHI...QM8V', amount: 8, timestamp: Date.now() - 30 * 60 * 1000 },
        ],
    },
    {
        id: 'seed-3',
        title: 'Community Management',
        description: 'Modded the discord community and successfully handled 500+ support tickets during the launch week.',
        freelancer: 'GCC2RJSQBH3B5P6S6JGURPKW4IVKZ5CRZPBG6LGQPDHXG2ZQYVMZSM',
        targetScore: 100,
        trustScore: 98,
        deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, 
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        endorsements: [],
    },
];

function loadTasks(): TrustTask[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as TrustTask[];
            return parsed;
        }
    } catch {
        // ignore parse errors
    }
    // Initialize with seed data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
    return SEED_TASKS;
}

function saveTasks(tasks: TrustTask[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    cache.clear(CACHE_KEY_TASKS);
}

export function useTrustSystem() {
    const [tasks, setTasks] = useState<TrustTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        // Try cache first
        const cached = cache.get<TrustTask[]>(CACHE_KEY_TASKS);
        if (cached) {
            setTasks(cached);
            return;
        }

        setIsLoading(true);
        try {
            // Simulate async fetch latency
            await new Promise(res => setTimeout(res, 300));
            const data = loadTasks();
            cache.set(CACHE_KEY_TASKS, data, CACHE_TTL);
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(
        async (input: CreateTaskInput, freelancer: string): Promise<TrustTask> => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise(res => setTimeout(res, 500));
                const newTask: TrustTask = {
                    id: generateId(),
                    title: input.title,
                    description: input.description,
                    freelancer,
                    targetScore: input.targetScore,
                    trustScore: 0,
                    deadline: input.deadline.getTime(),
                    createdAt: Date.now(),
                    endorsements: [],
                };
                const current = loadTasks();
                const updated = [newTask, ...current];
                saveTasks(updated);
                setTasks(updated);
                return newTask;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const endorseTask = useCallback(
        async (
            input: EndorseInput,
            client: string,
            signTx?: (xdr: string) => Promise<string>
        ): Promise<TrustEndorsement> => {
            setIsLoading(true);
            setError(null);

            const current = loadTasks();
            const task = current.find(t => t.id === input.taskId);
            const taskTitle = task?.title ?? 'TrustTask';

            let txHash = `DEMO_${generateId().toUpperCase()}`;
            let isRealTx = false;

            // If wallet is connected, we MUST attempt a real Stellar tx
            // This opens the Freighter confirmation popup
            if (signTx && client && client !== 'Anonymous') {
                try {
                    // Fund new testnet accounts via Friendbot
                    await ensureFunded(client);

                    // Build + sign (opens Freighter popup) + submit
                    const result = await buildAndSubmitDonationTx(
                        client,
                        input.amount,
                        taskTitle,
                        signTx
                    );
                    txHash = result.hash;
                    isRealTx = true;
                } catch (err) {
                    // Surface the error — don't silently fall back
                    setIsLoading(false);
                    const msg = err instanceof Error ? err.message : 'Transaction failed';
                    // If user rejected, tell them clearly
                    if (/reject|denied|cancel|decline/i.test(msg)) {
                        throw new Error('You rejected the transaction in Freighter. Please approve it to record your trust endorsement on the blockchain.');
                    }
                    // If account not funded / horizon error
                    if (/account/i.test(msg)) {
                        throw new Error('Your testnet account needs funding. Please visit https://friendbot.stellar.org to fund it, then try again.');
                    }
                    throw new Error(`Blockchain error: ${msg}`);
                }
            }

            const endorsement: TrustEndorsement = {
                id: generateId(),
                taskId: input.taskId,
                client: client || 'Anonymous',
                amount: input.amount,
                timestamp: Date.now(),
                txHash: isRealTx ? txHash : `DEMO_${txHash.slice(-8)}`,
            };

            const updated = current.map(t => {
                if (t.id !== input.taskId) return t;
                return {
                    ...t,
                    trustScore: t.trustScore + input.amount,
                    endorsements: [endorsement, ...t.endorsements],
                };
            });
            saveTasks(updated);
            setTasks(updated);
            setIsLoading(false);
            return endorsement;
        },
        []
    );

    // All endorsements across all tasks, most recent first
    const allEndorsements: (TrustEndorsement & { taskTitle: string })[] = tasks
        .flatMap(t => t.endorsements.map(e => ({ ...e, taskTitle: t.title })))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

    return {
        tasks,
        isLoading,
        error,
        fetchTasks,
        createTask,
        endorseTask,
        allEndorsements,
        formatXLM,
    };
}
