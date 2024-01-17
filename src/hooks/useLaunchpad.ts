import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";
import { PublicKey } from "@solana/web3.js";

const useLaunchpad = (pda: string) => {
  const { program } = useProgram();

  return useQuery({
    queryKey: ["launchpads", pda],
    queryFn: async () => {
      const launchPool = await program!.account.launchPool.fetch(
        new PublicKey(pda)
      );
      return launchPool;
    },
    enabled: !!program,
  });
};

export default useLaunchpad;
