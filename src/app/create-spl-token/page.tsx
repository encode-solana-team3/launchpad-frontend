"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgram } from "@/hooks/useProgram";
import {
  MintLayout,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { useState } from "react";
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { web3 } from "@coral-xyz/anchor";
import { toast } from "react-toastify";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const CreateSplTokenPage = () => {
  const { connection } = useProgram();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState(1000000);
  const [mint, setMint] = useState("");

  const handler = async () => {
    if (!publicKey) return;
    toast.promise(
      new Promise(async (resolve, reject) => {
        const mint_account = Keypair.generate();
        const mint_rent = await getMinimumBalanceForRentExemptMint(connection);
        const createMintAccountInstruction = await SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint_account.publicKey,
          space: MintLayout.span,
          lamports: mint_rent,
          programId: TOKEN_PROGRAM_ID,
        });

        const createMintInstruction = createInitializeMintInstruction(
          mint_account.publicKey,
          9,
          publicKey,
          publicKey
        );

        const associatedTokenAccount = await getAssociatedTokenAddress(
          mint_account.publicKey,
          publicKey
        );

        const createATAInstruction = createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAccount,
          publicKey,
          mint_account.publicKey
        );

        const mintInstruction = createMintToInstruction(
          mint_account.publicKey,
          associatedTokenAccount,
          publicKey,
          amount * LAMPORTS_PER_SOL
        );
        const recentBlockhash = await connection.getLatestBlockhash();

        const transaction = new web3.Transaction().add(
          createMintAccountInstruction,
          createMintInstruction,
          createATAInstruction,
          mintInstruction
        );

        transaction.recentBlockhash = recentBlockhash.blockhash;
        transaction.feePayer = publicKey;

        const signature = await sendTransaction(transaction, connection, {
          signers: [mint_account],
        });

        const tx = await connection.confirmTransaction(signature, "confirmed");
        setMint(mint_account.publicKey.toString());
        resolve(tx);
      }),
      {
        pending: "Creating Token Mint",
        success: "Token Mint Created",
        error: "Error Creating Token Mint",
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1>Create SPL Token Page</h1>
      <p>
        This page will create a SPL token with the default decimal value of 9.
      </p>
      <div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="Mint amount">Amount token</Label>
          <Input
            type="Mint amount"
            id="Mint amount"
            value={amount}
            placeholder="Input amount"
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Created token mint address</AlertTitle>
        <AlertDescription>
          {mint ? (
            <span className="text-green-500">{mint}</span>
          ) : (
            <span className="text-red-500">Not created yet</span>
          )}
        </AlertDescription>
      </Alert>
      <Button onClick={handler}>
        Create a token with default (decimal: 9)
      </Button>
    </div>
  );
};

export default CreateSplTokenPage;
