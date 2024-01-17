import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useProgram } from "./useProgram";
import { PublicKey } from "@solana/web3.js";
import { Program, web3 } from "@coral-xyz/anchor";
import { EncodeSolTeam3 } from "@/artifacts/encode_sol_team3";
import {
  findTreasurerAccount,
  findMintTokenAccount,
  findUserPoolAccount,
} from "@/utils/account";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import TxSubmitted from "@/components/TxSubmitted";

const useClaimToken = (launch_pad_pda: string) => {
  const toastRef = useRef<ReturnType<typeof toast>>();

  const wallet = useWallet();

  const { program } = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["buyToken", launch_pad_pda],
    mutationFn: async () => {
      toastRef.current = toast.loading("Claiming tokens...");
      if (!wallet?.publicKey) {
        return Promise.reject(new Error("Please connect your wallet"));
      }
      if (!program) {
        return Promise.reject(new Error("Program has not been initialized"));
      }
      return await claimToken(
        program,
        new PublicKey(launch_pad_pda),
        wallet.publicKey
      );
    },
    onSuccess: ({ tx }) => {
      toast.update(toastRef.current!, {
        render: (
          <TxSubmitted message="Claimed tokens successfully" txHash={tx} />
        ),
        type: "success",
        autoClose: 5000,
        isLoading: false,
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

export async function claimToken(
  program: Program<EncodeSolTeam3>,
  pool: PublicKey,
  buyer: PublicKey
) {
  const launch_pool = new PublicKey(pool);
  const poolData = await program.account.launchPool.fetch(launch_pool);

  const [treasurer] = findTreasurerAccount(
    launch_pool,
    poolData.tokenMint,
    program.programId
  );
  const treasury = await findMintTokenAccount(treasurer, poolData.tokenMint);
  const [user_pool] = findUserPoolAccount(
    buyer,
    launch_pool,
    poolData.tokenMint,
    program.programId
  );

  const userTokenAccount = await findMintTokenAccount(
    buyer,
    poolData.tokenMint
  );

  // const data = await program.account.userPool.fetch(user_pool);
  // console.log("User pool account: ", data.amount.toNumber());
  // console.log("user payed: ", data.currencyAmount.toNumber());

  // console.log(
  //   `buyer ${buyer.toBase58()} want claim ${data.amount.toNumber()} token ${mint.toBase58()} at launch pool ${launch_pool.toBase58()}`
  // );
  // console.log("--------------------------------------");

  const tx = await program.methods
    .claimToken()
    .accounts({
      launchPool: launch_pool,
      userPool: user_pool,
      treasurer,
      treasury,
      user: buyer,
      userTokenAccount,
      tokenMint: poolData.tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    })
    //   .signers([buyer.payer])
    .rpc();

  console.log("Claim token in tx: ", "\n", tx);
  console.log("********************************");
  return { tx };
}

export default useClaimToken;
