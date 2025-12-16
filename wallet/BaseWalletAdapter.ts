import { WalletAdapter, WalletAccount } from "./types";

export abstract class BaseWalletAdapter implements WalletAdapter {
  abstract id: WalletAdapter["id"];
  abstract name: string;

  protected account: WalletAccount | null = null;

  abstract isAvailable(): boolean;
  abstract connect(): Promise<WalletAccount>;
  
  // Default implementation throws, specific adapters override
  async switchChain(chain: string): Promise<WalletAccount> {
    throw new Error("Chain switching not supported by this wallet");
  }

  async disconnect(): Promise<void> {
    this.account = null;
  }

  getAccount(): WalletAccount | null {
    return this.account;
  }
}