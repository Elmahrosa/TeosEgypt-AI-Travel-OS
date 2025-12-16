import { BaseWalletAdapter } from "../BaseWalletAdapter";
import { WalletAccount } from "../types";

declare global {
  interface Window {
    Pi?: any;
  }
}

export class PiWalletAdapter extends BaseWalletAdapter {
  id = "pi" as const;
  name = "Pi Wallet";

  isAvailable(): boolean {
    // In production, check if running inside Pi Browser
    // return typeof window !== "undefined" && !!window.Pi;
    return true; 
  }

  async connect(): Promise<WalletAccount> {
    // Simulate Pi SDK connection delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock successful connection
    // Pi addresses are typically Stellar-format public keys (starting with G)
    this.account = {
      address: "GAP...TEOS-PI-USER", 
      chain: "Pi Network"
    };
    
    return this.account;
  }
  
  async switchChain(chain: string): Promise<WalletAccount> {
    // Pi Wallet is specific to Pi Network and does not support EVM/Solana switching
    if (chain === 'Pi Network') {
        return this.account!;
    }
    throw new Error(`Pi Wallet does not support switching to ${chain}. It only supports Pi Network.`);
  }
}