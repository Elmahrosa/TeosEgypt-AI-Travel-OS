export type WalletProviderType =
  | "metamask"
  | "phantom"
  | "pi"
  | "mock";

export type WalletStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface WalletAccount {
  address: string;
  chain?: string;
}

export interface WalletAdapter {
  readonly id: WalletProviderType;
  readonly name: string;

  connect(): Promise<WalletAccount>;
  disconnect(): Promise<void>;
  switchChain(chain: string): Promise<WalletAccount>;
  isAvailable(): boolean;

  getAccount(): WalletAccount | null;
}