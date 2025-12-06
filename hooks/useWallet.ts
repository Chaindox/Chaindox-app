import { useState } from "react";
import { providers, Signer } from "ethers";
import { WalletState } from "@/lib/types";

export function useWallet() {
  const [account, setAccount] = useState<string>("");
  const [signer, setSigner] = useState<Signer | null>(null);

  const connectWallet = async (): Promise<{
    success: boolean;
    message?: string;
    address?: string;
  }> => {
    const { ethereum, web3 } = window as any;
    
    if (!ethereum) {
      return {
        success: false,
        message: "MetaMask is not installed. Please install it to use this feature.",
      };
    }

    try {
      const injectedWeb3 = ethereum || (web3 && web3.currentProvider);
      const newProvider = new providers.Web3Provider(injectedWeb3, "any");
      
      await ethereum.request({ method: "eth_requestAccounts" });
      
      const _signer = await newProvider.getSigner();
      const address = await _signer.getAddress();
      
      setSigner(_signer);
      setAccount(address);

      return {
        success: true,
        message: `Successfully connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        address,
      };
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return {
        success: false,
        message: "Failed to connect to MetaMask. Please try again.",
      };
    }
  };

  const walletState: WalletState = {
    account,
    signer,
    isConnected: !!account && !!signer,
  };

  return {
    ...walletState,
    connectWallet,
  };
}