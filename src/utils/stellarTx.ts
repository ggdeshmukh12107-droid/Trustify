/**
 * Stellar testnet transaction builder for trust endorsements.
 * Calls Freighter to sign, which opens the confirmation popup.
 * Then submits the signed tx to the Stellar testnet.
 */
import {
    Horizon,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    Operation,
    Asset,
    Memo,
} from '@stellar/stellar-sdk';

const TESTNET_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(TESTNET_URL);

export interface DonationTxResult {
    hash: string;
    ledger: number;
}

/**
 * Build, sign (via Freighter — opens popup), and submit a Stellar testnet tx.
 *
 * Strategy: send `amount` XLM from the endorser's wallet to themselves
 * with a memo labelling the trust task. This creates a real on-chain record.
 *
 * @param endorser    The endorser's Stellar public key
 * @param amount      Amount of XLM (trust points) to send
 * @param taskTitle   Task name (used in the tx memo)
 * @param signTx      Freighter signTransaction callback (opens the popup)
 */
export async function buildAndSubmitDonationTx(
    endorser: string,
    amount: number,
    taskTitle: string,
    signTx: (xdr: string) => Promise<string>
): Promise<DonationTxResult> {
    // Load the account to get the latest sequence number
    const account = await server.loadAccount(endorser);

    // Stellar memo max is 28 bytes
    const memoText = `Trust: ${taskTitle}`.slice(0, 28);

    // The XLM amount to send — at minimum 0.0000001, but use actual amount if reasonable
    const xlmAmount = Math.max(0.0000001, Math.min(amount, 100)).toFixed(7);

    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(
            Operation.payment({
                destination: endorser, // Self-payment: safe, no external account needed
                asset: Asset.native(),
                amount: xlmAmount,
            })
        )
        .addMemo(Memo.text(memoText))
        .setTimeout(180) // 3 minutes for user to approve in Freighter
        .build();

    // Convert to XDR and send to Freighter for signing
    // This is what opens the Freighter confirmation popup
    const xdr = tx.toXDR();
    const signedXdr = await signTx(xdr);

    if (!signedXdr) {
        throw new Error('Freighter did not return a signed transaction. Did you approve it?');
    }

    // Parse the signed XDR and submit to Stellar testnet
    const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const result = await server.submitTransaction(signedTx);

    return {
        hash: result.hash,
        ledger: (result as unknown as { ledger: number }).ledger ?? 0,
    };
}

/**
 * Ensure the testnet account is funded via Friendbot.
 * Only does anything if the account doesn't exist yet.
 */
export async function ensureFunded(publicKey: string): Promise<boolean> {
    try {
        await server.loadAccount(publicKey);
        return true; // Already funded and active
    } catch {
        try {
            // New account — request testnet XLM from Friendbot
            const resp = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
            if (!resp.ok) return false;
            // Wait a moment for the ledger to close
            await new Promise(res => setTimeout(res, 3000));
            return true;
        } catch {
            return false;
        }
    }
}
