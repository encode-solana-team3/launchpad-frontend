import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useProgram } from "./useProgram";
import { BN, Program, web3 } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { EncodeSolTeam3 } from "@/artifacts/encode_sol_team3";
import dayjs from "dayjs";
import {
  findLaunchPoolAccount,
  findMintTokenAccount,
  findTreasurerAccount,
} from "@/utils/account";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const useCreateLaunchpad = () => {
  const toastRef = useRef<ReturnType<typeof toast>>();
  const wallet = useWallet();
  const { program } = useProgram();

  return useMutation({
    mutationKey: ["createLaunchpad"],
    mutationFn: async (payload: any) => {
      if (!wallet?.publicKey) {
        toast.error("Please connect your wallet");
        return Promise.reject(new Error("Please connect your wallet"));
      }
      if (!program) {
        toast.error("Program not found");
        return Promise.reject(new Error("Program not found"));
      }
      toastRef.current = toast.loading("Creating launchpad...");
      await createNativeFairlaunchPool(
        program,
        wallet.publicKey,
        new PublicKey(payload.mint),
        new BN(payload.pool_size * LAMPORTS_PER_SOL),
        new BN(dayjs(payload.unlock_date).unix()),
        payload.max,
        payload.min,
        new BN(payload.rate)
      );
    },
    onSuccess: (result: any) => {
      toast.update(toastRef.current!, {
        render: "Launchpad created",
        type: "success",
        autoClose: 5000,
        isLoading: false,
      });
    },
    onError: (error) => {
      console.error(error);
      toast.update(toastRef.current!, {
        render: error.message,
        type: "error",
        autoClose: 5000,
        isLoading: false,
      });
    },
  });
};

export async function createNativeFairlaunchPool(
  program: Program<EncodeSolTeam3>,
  creator: PublicKey,
  mint: PublicKey,
  pool_size = new BN(1000 * LAMPORTS_PER_SOL),
  unlock_date = new BN(dayjs().add(5, "s").unix()),
  max = 100,
  min = 50,
  rate = new BN(50)
) {
  const minimum_token_amount = new BN(min * LAMPORTS_PER_SOL);
  const maximum_token_amount = new BN(max * LAMPORTS_PER_SOL);
  const [launch_pool] = findLaunchPoolAccount(creator, mint, program.programId);
  console.log(
    `launch_pool: ${launch_pool.toBase58()} creator: ${creator.toBase58()} with mint: ${mint.toBase58()} creating ....`
  );
  console.log("--------------------------------------");

  const [treasurer] = findTreasurerAccount(
    launch_pool,
    mint,
    program.programId
  );
  const treasury = await findMintTokenAccount(treasurer, mint);

  const tx = await program.methods
    .createNativePool(
      unlock_date,
      pool_size,
      minimum_token_amount,
      maximum_token_amount,
      rate,
      9
    )
    .accounts({
      launchPool: launch_pool,
      authority: creator,
      tokenMint: mint,
      treasurer: treasurer,
      treasury: treasury,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    // .signers([creator.payer])
    .rpc();

  console.log("Create a new launchpool in tx: ", "\n", tx);
  console.log("********************************");
}

export default useCreateLaunchpad;
