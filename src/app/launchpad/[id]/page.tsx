"use client";

import { Button } from "@/components/ui/button";
import useLaunchpad from "@/hooks/useLaunchpad";
import useStartLaunchpad from "@/hooks/useStartLaunchpad";
import useCompleteLaunchpad from "@/hooks/useCompleteLaunchpad";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs from "dayjs";
import useBuyToken from "@/hooks/useBuyToken";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import useClaimToken from "@/hooks/useClaimToken";

type Props = {
  params: {
    id: string;
  };
};
const LaunchpadDetailPage: React.FC<Props> = ({ params }) => {
  const { data: launchpad, isPending } = useLaunchpad(params.id);
  const { mutate } = useStartLaunchpad(params.id);
  const { mutate: mutateComplete } = useCompleteLaunchpad(params.id);
  const { mutate: mutateBuyToken, isPending: isBuying } = useBuyToken(
    params.id
  );
  const [amount, setAmount] = useState(100);
  const { mutate: mutateClaimToken, isPending: isClaiming } = useClaimToken(
    params.id
  );

  const handleBuyToken = async () => {
    if (!launchpad) return;
    if (!amount) {
      toast.error("Amount must be greater than 0");
    }
    await mutateBuyToken(amount);
  };

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
        <div>Creator: {launchpad.authority.toBase58()}</div>
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
      <div className="space-2 my-4">
        {launchpad.status.pending ? (
          <Button onClick={() => mutate()}>
            Step 3: Start launchpad by creator
          </Button>
        ) : null}
        {launchpad.status.active ? (
          <div className="flex items-end gap-3">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="Buy amount">Amount token you want to buy</Label>
              <Input
                id="Buy amount"
                placeholder="input amount you want to buy"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <Button onClick={handleBuyToken} disabled={isBuying}>
              Step 4: User buy token
            </Button>
          </div>
        ) : null}
        {launchpad.status.active ? (
          <Button onClick={() => mutateComplete()}>
            Step 5: Creator complete launchpad
          </Button>
        ) : null}

        {dayjs(launchpad.unlockDate.toNumber() * 1000).isBefore(dayjs()) ? (
          <Button onClick={() => mutateClaimToken()}>
            Step 6: User claim token
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default LaunchpadDetailPage;
