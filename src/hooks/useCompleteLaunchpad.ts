import { useWallet } from "@solana/wallet-adapter-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useProgram } from "./useProgram";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { Program, web3, Wallet } from "@coral-xyz/anchor";
import { EncodeSolTeam3 } from "@/artifacts/encode_sol_team3";
import {
  findLaunchPoolAccount,
} from "@/utils/account";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const useCompleteLaunchpad = (launch_pad_pda: string) => {
  const toastRef = useRef<ReturnType<typeof toast>>();
  const wallet = useWallet();
  const { program } = useProgram();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["completeLaunchpad", launch_pad_pda],
    mutationFn: async () => {
      toastRef.current = toast.loading("Completing launch pool...");
      if (!wallet?.publicKey) {
        return Promise.reject(new Error("Please connect your wallet"));
      }
      if (!program) {
        return Promise.reject(new Error("Program has not been initialized"));
      }
      const launch_pool = new PublicKey(launch_pad_pda);
      const poolData = await program.account.launchPool.fetch(launch_pool);
      return await completeLaunchPool(
        program,
        wallet.publicKey,
        poolData.tokenMint
      );
    },
    onSuccess: (result: any) => {
      toast.update(toastRef.current!, {
        render: "Launch pool Completed",
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

export async function completeLaunchPool(
  program: Program<EncodeSolTeam3>,
  creator: PublicKey,
  mint: PublicKey
) {
  const [launch_pool] = findLaunchPoolAccount(
    creator,
    mint,
    program.programId
  );

  console.log(
    `launch pool ${launch_pool.toBase58()} run to completed by ${creator.toBase58()} with mint ${mint.toBase58()}`
  );
  console.log("--------------------------------------");
  const tx = await program.methods
    .completeLaunchPool()
    .accounts({
      launchPool: launch_pool,
      authority: creator,
      tokenMint: mint,
    })
    // .signers([creator.payer])
    .rpc();

  console.log("Complete launch pool in tx:", "\n", tx);
  console.log("********************************");
}

export default useCompleteLaunchpad;
