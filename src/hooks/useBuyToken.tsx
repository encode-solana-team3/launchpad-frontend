import { Wallet, useWallet } from "@solana/wallet-adapter-react";
import { useRef } from "react";
import { useProgram } from "./useProgram";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN, Program, web3 } from "@coral-xyz/anchor";
import { EncodeSolTeam3 } from "@/artifacts/encode_sol_team3";
import {
  findLaunchPoolAccount,
  findUserPoolAccount,
  findVaultAccount,
} from "@/utils/account";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import TxSubmitted from "@/components/TxSubmitted";
import React from "react";

const useBuyToken = (launch_pad_pda: string) => {
  const toastRef = useRef<ReturnType<typeof toast>>();
  const wallet = useWallet();
  const { program } = useProgram();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["buyToken", launch_pad_pda],
    mutationFn: async (amount: number) => {
      if (!wallet?.publicKey) {
        return Promise.reject(new Error("Please connect your wallet"));
      }
      if (!program) {
        return Promise.reject(new Error("Program has not been initialized"));
      }

      toastRef.current = toast.loading("Buying token...");
      const launch_pool = new PublicKey(launch_pad_pda);
      const poolData = await program.account.launchPool.fetch(launch_pool);
      const minCanBuy = poolData.minimumTokenAmount.div(
        new BN(10).pow(new BN(poolData.tokenMintDecimals))
      );
      const maxCanBuy = poolData.maximumTokenAmount.div(
        new BN(10).pow(new BN(poolData.tokenMintDecimals))
      );

      if (new BN(amount).lt(minCanBuy) || new BN(amount).gt(maxCanBuy)) {
        return Promise.reject(
          new Error(`Amount should be between ${minCanBuy} and ${maxCanBuy}`)
        );
      }
      const _mustPay = new BN(Number(amount))
        .mul(new BN(10).pow(new BN(9)))
        .div(poolData.rate);

      const _balance = new BN(
        await program.provider.connection.getBalance(wallet.publicKey)
      );
      if (_balance.lt(_mustPay)) {
        return Promise.reject(
          new Error(
            `Insufficient balance, you need ${_mustPay.toString()} lamport to buy ${amount} token`
          )
        );
      }

      console.log("amount: ", _mustPay.toString(), _balance.toString());

      return await buyToken(program, launch_pool, wallet.publicKey, amount);
    },
    onSuccess: ({ tx }) => {
      toast.update(toastRef.current!, {
        render: <TxSubmitted txHash={tx} message="Token bought successfully" />,
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

export async function buyToken(
  program: Program<EncodeSolTeam3>,
  pool: PublicKey,
  buyer: PublicKey,
  amount: number | string
) {
  const launch_pool = new PublicKey(pool);
  const poolData = await program.account.launchPool.fetch(launch_pool);
  const mint = new PublicKey(poolData.tokenMint);
  const [user_pool] = findUserPoolAccount(
    buyer,
    launch_pool,
    mint,
    program.programId
  );

  const [vault] = findVaultAccount(
    launch_pool,
    poolData.authority,
    program.programId
  );

  console.log(
    `buyer ${buyer.toBase58()} want buy ${amount} token at launch pool ${launch_pool.toBase58()}`
  );
  console.log("--------------------------------------");
  const tx = await program.methods
    .buyTokenWithNative(
      new BN(amount).mul(new BN(10).pow(new BN(poolData.tokenMintDecimals)))
    )
    .accounts({
      launchPool: launch_pool,
      userPool: user_pool,
      user: buyer,
      vault,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    })
    // .signers([buyer.payer])
    .rpc();

  console.log("Buy token in tx: ", "\n", tx);

  const data = await program.account.userPool.fetch(user_pool);
  console.log("User pool account: ", data.amount.toNumber());
  console.log("********************************");
  return { tx };
}

export default useBuyToken;
