"use client";
import ButtonCreateLaunchpad from "@/components/ButtonCreateLaunchpad";
import { useState } from "react";

const CreatePage = () => {
  const [tokenMint, setTokenMint] = useState("");
  const [rate, setRate] = useState(0);
  return (
    <div>
      <h1>Create Page</h1>
      <div className="space-y-2 p-5 border-gray-500 border-2">
        <div className="space-x-2">
          <label htmlFor="tokenMint">Token mint</label>
          <input
            id="tokenMint"
            type="text"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onChange={(e) => setTokenMint(e.target.value)}
          />
        </div>
        <div className="space-x-2">
          <label htmlFor="rate">Rate</label>
          <input
            id="rate"
            type="number"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
        <ButtonCreateLaunchpad
          payload={{
            tokenMint,
            rate,
          }}
        />
      </div>
    </div>
  );
};

export default CreatePage;
