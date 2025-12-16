import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Itinerary, UserPreferences } from '../types';
import { CreditCard, Wallet, ShieldCheck, Check, Loader2, ArrowLeft, Info, RefreshCw, Link as LinkIcon, LogOut, Coins, ArrowRightLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { MockWalletAdapter } from '../wallet/adapters/MockWalletAdapter';
import { useWallet } from '../wallet/useWallet';

interface CheckoutState {
  itinerary: Itinerary;
  prefs: UserPreferences;
}

interface CryptoQuote {
  tokenSymbol: string;
  tokenName: string;
  priceUsd: number;
  gasUsd: number;
  amountNeeded: number;
}

// Token Configuration with Network & UI details
const TOKEN_DATA: Record<string, { price: number; name: string; chain: 'EVM' | 'Solana'; color: string }> = {
  TEOS: { price: 0.42, name: 'TEOS Token', chain: 'EVM', color: 'bg-amber-500' },
  USDT: { price: 1.00, name: 'Tether USD', chain: 'EVM', color: 'bg-emerald-500' },
  SOL: { price: 145.20, name: 'Solana', chain: 'Solana', color: 'bg-purple-500' },
  ERT: { price: 0.085, name: 'Egypt Resort', chain: 'EVM', color: 'bg-blue-600' },
  USD1: { price: 1.00, name: 'USD1 Stable', chain: 'EVM', color: 'bg-cyan-500' },
  EGP: { price: 0.021, name: 'Digital EGP', chain: 'EVM', color: 'bg-red-600' },
};

// Mock Balances for Demo
const MOCK_BALANCES: Record<string, string> = {
  TEOS: '1,250.00',
  USDT: '420.50',
  SOL: '14.20',
  ERT: '10,000.00',
  USD1: '1,000.00',
  EGP: '25,450.00'
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState;
  
  // Initialize Adapter (Memoize to persist across renders)
  const adapter = useMemo(() => new MockWalletAdapter(), []);
  const { status, account, error: walletError, connect, disconnect, switchChain } = useWallet(adapter);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [selectedToken, setSelectedToken] = useState<string>('TEOS');
  const [processing, setProcessing] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  if (!state?.itinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-slate-500 mb-4">No itinerary selected.</p>
        <button onClick={() => navigate('/planner')} className="text-amber-500 font-bold hover:underline">Return to Planner</button>
      </div>
    );
  }

  const { itinerary, prefs } = state;
  const costString = itinerary.totalEstimatedCost || "$1,200";
  const costNumeric = parseInt(costString.replace(/[^0-9]/g, '')) || 1200;

  const getQuote = async (tokenKey: string = selectedToken) => {
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      // Simulate API Fetch delay
      await new Promise((resolve) => setTimeout(resolve, 600)); 
      
      const tokenInfo = TOKEN_DATA[tokenKey];
      if (!tokenInfo) throw new Error("Token data unavailable");

      const price = tokenInfo.price;
      
      // Dynamic gas calculation: Solana is cheaper than EVM
      const baseGas = tokenInfo.chain === 'Solana' ? 0.002 : 0.15;
      const variableGas = 0.001 * costNumeric; 
      const gas = baseGas + variableGas;
      
      const needed = (costNumeric + gas) / price;

      setQuote({
        tokenSymbol: tokenKey,
        tokenName: tokenInfo.name,
        priceUsd: price,
        gasUsd: gas,
        amountNeeded: needed
      });
    } catch (e: any) {
      let msg = "Failed to fetch crypto quote.";
      if (e.message?.includes("Network")) msg = "Network error: Unable to fetch real-time prices.";
      setQuoteError(msg);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleNetworkSwitch = async (targetChain: string) => {
      if (switchingNetwork) return;
      setSwitchingNetwork(true);
      try {
        await switchChain(targetChain);
      } catch (e) {
          console.error("Switch failed", e);
      } finally {
          setSwitchingNetwork(false);
      }
  };

  const handlePayment = () => {
    if (paymentMethod === 'crypto' && status !== 'connected') {
      alert("Please connect your wallet first.");
      return;
    }
    
    setProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      alert(paymentMethod === 'crypto' 
        ? `Transaction Broadcasted! Sent ${quote?.amountNeeded.toFixed(4)} ${quote?.tokenSymbol} from ${account?.address} on ${account?.chain}` 
        : "Order Created! Redirecting to Stripe..."
      );
    }, 2000);
  };

  // Auto-fetch quote when switching to Crypto or changing Token
  // Also handles Auto-Switching logic
  useEffect(() => {
    if (paymentMethod === 'crypto') {
      getQuote(selectedToken);
      
      const targetChain = TOKEN_DATA[selectedToken].chain;
      
      // If wallet is connected but chain mismatches, simulate switch
      if (status === 'connected' && account?.chain !== targetChain && !switchingNetwork) {
          handleNetworkSwitch(targetChain);
      }
    }
  }, [paymentMethod, selectedToken, status, account?.chain]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Plan
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Review & Pay</h2>
            
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{itinerary.tripTitle || "Custom Egypt Trip"}</h3>
                <p className="text-slate-500 text-sm mt-1">{prefs.duration} • {prefs.selectedCities.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{costString}</p>
                <p className="text-xs text-slate-400">Total Estimated</p>
              </div>
            </div>

            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Payment Method</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-bold text-sm">Credit Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all relative overflow-hidden ${
                  paymentMethod === 'crypto' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">MULTI-CHAIN</div>
                <Coins className="w-6 h-6" />
                <span className="font-bold text-sm">Crypto / Token</span>
              </button>
            </div>

            {paymentMethod === 'crypto' && (
              <div className="space-y-4 mb-6 animate-fade-in">
                
                {/* Error Banner */}
                {(walletError || quoteError) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-900 dark:text-red-100 text-sm">Action Failed</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {walletError || quoteError}
                            </p>
                            {walletError && (
                                <button 
                                    onClick={() => { if(status === 'disconnected' || status === 'error') connect(); }}
                                    className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" /> Retry Connection
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Token Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Payment Token</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {Object.keys(TOKEN_DATA).map((token) => (
                      <button
                        key={token}
                        onClick={() => setSelectedToken(token)}
                        disabled={switchingNetwork}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                          selectedToken === token
                            ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 shadow-md'
                            : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                        } ${switchingNetwork ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span 
                          className={`w-2.5 h-2.5 rounded-full ${TOKEN_DATA[token].color}`} 
                          title={`${TOKEN_DATA[token].chain} Network`}
                        />
                        {token}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crypto Payment Section */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      {TOKEN_DATA[selectedToken].name} Quote
                    </h4>
                    <button 
                      onClick={() => getQuote(selectedToken)} 
                      disabled={quoteLoading || switchingNetwork}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${quoteLoading ? 'animate-spin' : ''}`} />
                      Refresh Rate
                    </button>
                  </div>

                  {quote ? (
                    <div className="space-y-3 text-sm bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400">Token Price (USD)</span>
                         <span className="font-mono text-slate-900 dark:text-white font-medium">${quote.priceUsd.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400">Network Fee (~Gas)</span>
                         <span className="font-mono text-slate-900 dark:text-white font-medium">${quote.gasUsd.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                         <span className="font-bold text-slate-900 dark:text-white">Total Required</span>
                         <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{quote.amountNeeded.toFixed(4)} {quote.tokenSymbol}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center p-4">
                      {quoteLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      ) : (
                        <div className="text-slate-400 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {quoteError ? "Quote unavailable" : "Fetching rates..."}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                    {status !== 'connected' ? (
                      <button 
                        onClick={() => connect()}
                        disabled={status === 'connecting'}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                      >
                         <LinkIcon className="w-4 h-4" />
                         {status === 'connecting' ? 'Connecting...' : `Connect ${TOKEN_DATA[selectedToken].chain} Wallet`}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 transition-all">
                        {switchingNetwork ? (
                            <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                                <ArrowRightLeft className="w-4 h-4" />
                                <span className="text-sm font-bold">Switching to {TOKEN_DATA[selectedToken].chain} Network...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-blue-900 dark:text-blue-100">Wallet Connected</p>
                                        <span className={`text-[10px] px-1.5 rounded-full border ${account?.chain === 'Solana' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                            {account?.chain}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-mono text-blue-700 dark:text-blue-300">{account?.address}</p>
                                </div>
                            </div>
                        )}
                        <button 
                          onClick={() => disconnect()}
                          disabled={switchingNetwork}
                          className="text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="Disconnect"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 leading-tight">
                        Payment Network
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                        TOKEN_DATA[selectedToken].chain === 'Solana' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${TOKEN_DATA[selectedToken].chain === 'Solana' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                        {TOKEN_DATA[selectedToken].chain} Mainnet
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={processing || switchingNetwork || (paymentMethod === 'crypto' && (status !== 'connected' || !quote))}
              className="w-full py-4 bg-slate-900 dark:bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {(processing || switchingNetwork) ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {paymentMethod === 'card' 
                ? `Pay ${costString}` 
                : (quote ? `Pay ${quote.amountNeeded.toFixed(2)} ${quote.tokenSymbol}` : 'Calculate Quote First')
              }
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Secure Payment Gateway by Stripe & TEOS Custody
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* Token Balance Info */}
           <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold mb-1 flex items-center gap-2">
                 <Wallet className="w-4 h-4 text-blue-400" />
                 Wallet Balance
               </h3>
               {status === 'connected' && !switchingNetwork ? (
                 <>
                   <p className="text-3xl font-bold text-blue-400 mb-1">
                     {MOCK_BALANCES[selectedToken] || '0.00'}
                   </p>
                   <p className="text-xs text-slate-400">{selectedToken} Available</p>
                 </>
               ) : (
                 <p className="text-sm text-slate-400 mt-2">Connect wallet to view balance</p>
               )}
               
               <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-400">Market Trend</span>
                   <span className="font-mono text-green-400">+2.4%</span>
                 </div>
               </div>
             </div>
             {/* Abstract BG */}
             <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${TOKEN_DATA[selectedToken].color.replace('bg-', 'bg-')}`}></div>
           </div>

           <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Included in your plan</h3>
             <ul className="space-y-3">
               <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                 <Check className="w-4 h-4 text-green-500 shrink-0" />
                 Full day-by-day Itinerary
               </li>
               <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                 <Check className="w-4 h-4 text-green-500 shrink-0" />
                 Hotel & Transport Reservations
               </li>
               <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                 <Check className="w-4 h-4 text-green-500 shrink-0" />
                 24/7 AI Concierge Support
               </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;