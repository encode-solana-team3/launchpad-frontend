"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "@radix-ui/react-separator";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs from "dayjs";
import { Button } from "./ui/button";
import Link from "next/link";
import useLaunchpads from "@/hooks/useLaunchpads";

const LaunchpadView = () => {
  const { data } = useLaunchpads();
  return (
    <div className="space-y-4 my-4">
      <h1 className="uppercase">Launchpad list</h1>
      <Separator />
      <div className="grid grid-cols-3 gap-4">
        {data?.map((launchpad, index) => {
          return (
            <Card key={launchpad.publicKey.toBase58()}>
              <CardHeader>
                <CardTitle>Launchpad {index + 1}</CardTitle>
                <CardDescription>
                  Address: {launchpad.publicKey.toBase58()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div> Token Mint: {launchpad.account.tokenMint.toBase58()}</div>
                <div>
                  Allocation:{" "}
                  {launchpad.account.poolSize.toNumber() / LAMPORTS_PER_SOL}
                </div>
                <div>
                  Price:{" "}
                  <span className="text-orange-600 font-bold">
                    {1 / launchpad.account.rate.toNumber()}
                  </span>{" "}
                  SOL
                </div>
                <div>
                  Unlock Date:{" "}
                  {dayjs(launchpad.account.unlockDate.toNumber() * 1000).format(
                    "YYYY-MM-DD"
                  )}
                </div>
                <div>
                  <Link href={`/launchpad/${launchpad.publicKey.toBase58()}`}>
                    <Button>Detail</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LaunchpadView;
