"use client";
import useCreateLaunchpad from "@/hooks/useCreateLaunchpad";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import dayjs from "dayjs";
import { Button } from "./ui/button";

type Props = {
  payload: {
    tokenMint: string;
    rate: number;
  };
};

const ButtonCreateLaunchpad: React.FC<Props> = ({ payload }) => {
  const { mutate } = useCreateLaunchpad();
  const handler = () => {
    mutate({
      mint: payload.tokenMint,
      pool_size: new BN(1000 * LAMPORTS_PER_SOL),
      unlock_date: new BN(dayjs().add(15, "m").unix()),
      max: 100,
      min: 50,
      rate: payload.rate,
    });
  };
  return <Button onClick={handler}>Create launchpad</Button>;
};

export default ButtonCreateLaunchpad;
