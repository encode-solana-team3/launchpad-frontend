import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";

const useLaunchpads = () => {
  const { program } = useProgram();

  return useQuery({
    queryKey: ["launchpads"],
    queryFn: async () => {
      const launchpads = await program!.account.launchPool.all();
      return launchpads;
    },
  });
};

export default useLaunchpads;
