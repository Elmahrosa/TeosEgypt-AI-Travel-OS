import { WalletAdapter } from "./types";

export class WalletManager {
  private adapters: WalletAdapter[];

  constructor(adapters: WalletAdapter[]) {
    this.adapters = adapters;
  }

  getAvailableWallets(): WalletAdapter[] {
    return this.adapters.filter(a => a.isAvailable());
  }

  getAdapter(id: string): WalletAdapter | undefined {
    return this.adapters.find(a => a.id === id);
  }
}