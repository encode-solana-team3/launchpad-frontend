"use client";

import { Button } from "@/components/ui/button";
import useLaunchpad from "@/hooks/useLaunchpad";
import useStartLaunchpad from "@/hooks/useStartLaunchpad";
import useCompleteLaunchpad from "@/hooks/useCompleteLaunchpad";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs from "dayjs";

type Props = {
  params: {
    id: string;
  };
};
const LaunchpadDetailPage: React.FC<Props> = ({ params }) => {
  const { data: launchpad, isPending } = useLaunchpad(params.id);
  const { mutate } = useStartLaunchpad(params.id);
  const { mutate: mutateComplete } = useCompleteLaunchpad(params.id);
  if (!launchpad || isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Launch detail</h1>
      <h2>
        Status:{" "}
        <span className="uppercase font-bold text-red-500">
          {Object.keys(launchpad.status)}
        </span>
      </h2>
      <p>id: {params.id}</p>
      <div>
        <div> Token Mint: {launchpad.tokenMint.toBase58()}</div>
        <div>
          Allocation: {launchpad.poolSize.toNumber() / LAMPORTS_PER_SOL}
        </div>
        <div>
          Price:{" "}
          <span className="text-orange-600 font-bold">
            {1 / launchpad.rate.toNumber()}
          </span>{" "}
          SOL
        </div>
        <div>
          Unlock Date:{" "}
          {dayjs(launchpad.unlockDate.toNumber() * 1000).format("YYYY-MM-DD")}
        </div>
        <div>
          Minimun can buy:{" "}
          {launchpad.minimumTokenAmount.toNumber() / LAMPORTS_PER_SOL}
        </div>
        <div>
          Maximum can buy:{" "}
          {launchpad.maximumTokenAmount.toNumber() / LAMPORTS_PER_SOL}
        </div>
        <div>
          Token remaining amount:{" "}
          {launchpad.poolSizeRemaining.toNumber() / LAMPORTS_PER_SOL}
        </div>
      </div>
      <div className="space-x-2 my-4">
        {launchpad.status.pending ? (
          <Button onClick={() => mutate()}>Start launchpad</Button>
        ) : null}
        {launchpad.status.active ? <Button onClick={() => mutateComplete()}>Complete launchpad</Button> : null}
        {launchpad.status.active ? <Button>Buy token</Button> : null}
        {dayjs(launchpad.unlockDate.toNumber() * 1000).isBefore(dayjs()) ? (
          <Button>Claim token</Button>
        ) : null}
      </div>
    </div>
  );
};

export default LaunchpadDetailPage;
