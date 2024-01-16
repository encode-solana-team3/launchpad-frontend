import { useAnchorProvider } from "@/components/SolanaProvider";
import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { IDL as EncodeSolTeam3IDL } from "../artifacts/encode_sol_team3";
import { PublicKey } from "@solana/web3.js";

export function useProgram() {
  const { connection } = useConnection();

  const provider = useAnchorProvider();
  const programId = useMemo(
    () => new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!),
    []
  );
  const program = useMemo(
    () => new Program(EncodeSolTeam3IDL, programId, provider),
    [programId, provider]
  );

  return useMemo(() => {
    return {
      program,
      programId,
      connection,
    };
  }, [program, programId, connection]);
}
