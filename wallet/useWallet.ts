import { useState } from "react";
import { WalletAdapter, WalletStatus, WalletAccount } from "./types";

export function useWallet(adapter: WalletAdapter) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setError(null);
    try {
      setStatus("connecting");
      const acc = await adapter.connect();
      setAccount(acc);
      setStatus("connected");
    } catch (e: any) {
      setStatus("error");
      const msg = e instanceof Error ? e.message : "Connection failed. Please ensure your wallet is unlocked.";
      setError(msg);
      console.error("Wallet connection error:", e);
    }
  };

  const disconnect = async () => {
    setError(null);
    try {
      await adapter.disconnect();
    } catch (e: any) {
      console.error("Disconnect error", e);
      // We still reset state even if disconnect fails cleanly
    }
    setAccount(null);
    setStatus("disconnected");
  };

  const switchChain = async (chain: string) => {
    setError(null);
    if (!adapter.switchChain) {
        setError(`This wallet does not support switching to ${chain} automatically.`);
        return;
    }
    try {
        const acc = await adapter.switchChain(chain);
        setAccount(acc);
    } catch (e: any) {
        const msg = e instanceof Error ? e.message : `Failed to switch network to ${chain}.`;
        setError(msg);
        console.error("Chain switch error:", e);
    }
  };

  return {
    status,
    account,
    error,
    connect,
    disconnect,
    switchChain
  };
}