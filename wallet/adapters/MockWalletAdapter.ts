import { BaseWalletAdapter } from "../BaseWalletAdapter";
import { WalletAccount } from "../types";

export class MockWalletAdapter extends BaseWalletAdapter {
  id = "mock" as const;
  name = "Demo Wallet";

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<WalletAccount> {
    // Default to EVM on first connect
    await new Promise((resolve) => setTimeout(resolve, 600));
    this.account = {
      address: "0x...TEOS-DEMO",
      chain: "EVM"
    };
    return this.account;
  }

  async switchChain(chain: string): Promise<WalletAccount> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (chain === 'Solana') {
        this.account = {
            address: "8x...SOL-DEMO",
            chain: "Solana"
        };
    } else {
        this.account = {
            address: "0x...TEOS-DEMO",
            chain: "EVM"
        };
    }
    return this.account;
  }
}