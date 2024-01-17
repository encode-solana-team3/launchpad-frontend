import { useWallet } from "@solana/wallet-adapter-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useProgram } from "./useProgram";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { Program, web3 } from "@coral-xyz/anchor";
import { EncodeSolTeam3 } from "@/artifacts/encode_sol_team3";
import {
  findLaunchPoolAccount,
  findMintTokenAccount,
  findTreasurerAccount,
} from "@/utils/account";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import TxSubmitted from "@/components/TxSubmitted";

const useStartLaunchpad = (launch_pad_pda: string) => {
  const toastRef = useRef<ReturnType<typeof toast>>();
  const wallet = useWallet();
  const { program } = useProgram();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["startLaunchpad", launch_pad_pda],
    mutationFn: async () => {
      toastRef.current = toast.loading("Starting launch pool...");
      if (!wallet?.publicKey) {
        return Promise.reject(new Error("Please connect your wallet"));
      }
      if (!program) {
        return Promise.reject(new Error("Program has not been initialized"));
      }
      const launch_pool = new PublicKey(launch_pad_pda);
      const poolData = await program.account.launchPool.fetch(launch_pool);
      return await startLaunchPool(
        program,
        wallet.publicKey,
        poolData.tokenMint
      );
    },
    onSuccess: ({ tx }) => {
      toast.update(toastRef.current!, {
        render: (
          <TxSubmitted message="Launch pool started successfully" txHash={tx} />
        ),
        type: "success",
        autoClose: 5000,
        isLoading: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["launchpads", launch_pad_pda],
      });
    },
    onError: (error) => {
      toast.update(toastRef.current!, {
        render: error.message,
        type: "error",
        autoClose: 5000,
        isLoading: false,
      });
    },
  });
};

export async function startLaunchPool(
  program: Program<EncodeSolTeam3>,
  creator: PublicKey,
  mint: PublicKey
) {
  const [launch_pool] = findLaunchPoolAccount(creator, mint, program.programId);
  const source_token_account = await findMintTokenAccount(creator, mint);
  const [treasurer] = findTreasurerAccount(
    launch_pool,
    mint,
    program.programId
  );
  const treasury = await findMintTokenAccount(treasurer, mint);

  console.log(
    `launch_pool: ${launch_pool.toBase58()} creator: ${creator.toBase58()} with mint: ${mint.toBase58()} starting ....`
  );
  console.log("--------------------------------------");
  const tx = await program.methods
    .startLaunchPool()
    .accounts({
      launchPool: launch_pool,
      tokenMint: mint,
      sourceTokenAccount: source_token_account,
      treasurer: treasurer,
      treasury: treasury,
      authority: creator,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
    })
    // .signers([creator.payer])
    .rpc();
  console.log("Start launch pool in tx: ", "\n", tx);
  console.log("********************************");
  return { tx };
}

export default useStartLaunchpad;
