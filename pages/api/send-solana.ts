// pages/api/transfer-solana.ts

import type { NextApiRequest, NextApiResponse } from "next";
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

/**
 * Connection to Solana devnet. 
 * Swap in "mainnet-beta" if you want production.
 */
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Example USDC Mint address on Devnet (change if needed)
const USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

/**
 * Next.js API handler (POST request).
 * Expects JSON body: { senderAddress, recipientAddress, amount }
 *
 * Returns a base58 encoded transaction string.
 * That transaction is suitable for signing by the sender
 * and can then be broadcast via Crossmint or your own code.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { senderAddress, recipientAddress, amount } = req.body;

  // Basic validation
  if (!senderAddress || !recipientAddress || !amount) {
    return res
      .status(400)
      .json({ error: "Missing senderAddress, recipientAddress, or amount" });
  }

  try {
    // Convert addresses to PublicKeys
    const senderPublicKey = new PublicKey(senderAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Retrieve the associated token accounts for both sender + recipient
    const senderTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      senderPublicKey
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipientPublicKey
    );

    console.log("Sender token account:", senderTokenAccount.toBase58());
    console.log("Recipient token account:", recipientTokenAccount.toBase58());

    // For USDC, we multiply the amount by 10^6
    // Adjust if you are transferring a different SPL token
    const amountInBaseUnits = amount * 1_000_000;

    // Build up the transaction instructions array
    const instructions = [];

    // Check if the recipient's token account already exists
    const recipientAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );

    // If no token account exists for recipient, create one
    if (!recipientAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          senderPublicKey,          // payer
          recipientTokenAccount,     // ATA to be created
          recipientPublicKey,        // owner of the token account
          USDC_MINT,                 // which token mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Transfer instruction (from senderTokenAccount -> recipientTokenAccount)
    instructions.push(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPublicKey,
        amountInBaseUnits,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Fetch a valid recent blockhash
    const latestBlockhash = await connection.getLatestBlockhash();

    // Create a Versioned Transaction Message
    const message = new TransactionMessage({
      instructions,
      recentBlockhash: latestBlockhash.blockhash,
      payerKey: senderPublicKey, // The sender pays fees; be sure to match who will sign
    }).compileToV0Message();

    // Construct the VersionedTransaction
    const transaction = new VersionedTransaction(message);

    // --- NOTE ---
    // At this point, you typically would NOT sign the transaction server-side 
    // if you want Crossmint or your own client to sign it. 
    // Just serialize it unsigned, and allow the client or Crossmint to do the signing.
    // -------------
    
    // Serialize (unsigned) and encode as base58
    const base58Transaction = bs58.encode(transaction.serialize());

    // Return the base58-encoded transaction to the client
    return res.status(200).json({ base58Transaction });
  } catch (error) {
    console.error("Error creating transfer transaction:", error);
    return res
      .status(500)
      .json("Internal Server Error");
  }
}
