"use client";

import React, { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SolanaProvider } from "./SolanaProvider";

export function AppProvider({ children }: { children: ReactNode }) {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <SolanaProvider>{children}</SolanaProvider>
    </QueryClientProvider>
  );
}
