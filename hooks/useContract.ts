// hooks/useContract.ts

import { useState } from "react";
import { ethers, providers, Signer } from "ethers";
import {
  getTitleEscrowAddress,
  v5Contracts,
  v4Contracts,
  fetchEndorsementChain,
  getTokenRegistryAddress,
  getTokenId,
  isTransferableRecord,
  isTitleEscrowVersion,
  TitleEscrowInterface
} from "@trustvc/trustvc";
import { ContractState, ActionButton, VerifiedDocument } from "@/lib/types";
import { CHAIN_CONFIG, ZERO_ADDRESS, STORAGE_KEYS } from "@/lib/constants";
import { executeContractAction } from "@/lib/contract/actions";
import { decodeContractError } from "@/lib/contract/errors";
import { validateAddress, checkActionPermission } from "@/lib/contract/validation";

export function useContract(account: string, signer: Signer | null) {
  const [state, setState] = useState<ContractState>({
    titleEscrowAddress: "",
    holder: "",
    beneficiary: "",
    prevHolder: "",
    prevBeneficiary: "",
    nominee: "",
    encryptionId: "",
    endorsementChain: [],
  });

  const [newHolder, setNewHolder] = useState<string>("");
  const [newBeneficiary, setNewBeneficiary] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  // Load document from parsed VC data
  const loadDocument = async (parsedData: VerifiedDocument) => {
    try {
      // Unwrap if it's wrapped in signedW3CDocument
      const vc = 'signedW3CDocument' in parsedData
        ? parsedData.signedW3CDocument
        : parsedData;

      console.log("1. Validating document type...");

      // Check if it's a transferable record
      if (!isTransferableRecord(vc as any)) {
        return {
          success: false,
          error: "Document is not a transferable record",
        };
      }

      console.log("2. Extracting token information...");

      // Use utility functions instead of direct property access
      const tokenRegistry = getTokenRegistryAddress(vc as any);
      const tokenId = getTokenId(vc as any);

      if (!tokenRegistry || !tokenId) {
        console.error("Missing token information:", { tokenRegistry, tokenId });
        return {
          success: false,
          error: "Invalid document: missing tokenRegistry or tokenId information.",
        };
      }

      console.log("3. Token info extracted:", { tokenRegistry, tokenId: tokenId.substring(0, 10) + '...' });

      console.log("4. Initializing provider...");
      const _provider = new providers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);

      if (!_provider) {
        throw new Error("Provider initialization failed");
      }

      console.log("5. Getting title escrow address...");
      // tokenId from getTokenId() already includes '0x' prefix for W3C VC,
      // but not for OA V2/V3, so we need to handle both cases
      const formattedTokenId = tokenId.startsWith('0x') ? tokenId : '0x' + tokenId;

      const titleEscrowAddress = await getTitleEscrowAddress(
        tokenRegistry,
        formattedTokenId,
        _provider
      );
      console.log("6. Title escrow address:", titleEscrowAddress);

      console.log("7. Detecting contract version...");
      // Check if it's v4 or v5 contract
      const isV5 = await isTitleEscrowVersion({
        titleEscrowAddress,
        versionInterface: TitleEscrowInterface.V5,
        provider: _provider
      });

      console.log(`8. Contract is v${isV5 ? '5' : '4'} - Creating contract instance...`);
      const contractAbi = isV5
        ? v5Contracts.TitleEscrow__factory.abi
        : v4Contracts.TitleEscrow__factory.abi;

      const contract = new ethers.Contract(
        titleEscrowAddress,
        contractAbi,
        _provider
      );

      console.log("9. Fetching contract state...");
      // V4 contracts don't have prevHolder/prevBeneficiary methods
      let holder, beneficiary, prevHolder, prevBeneficiary, nominee;

      if (isV5) {
        [holder, beneficiary, prevHolder, prevBeneficiary, nominee] = await Promise.all([
          contract.holder(),
          contract.beneficiary(),
          contract.prevHolder(),
          contract.prevBeneficiary(),
          contract.nominee(),
        ]);
      } else {
        // V4 only has holder, beneficiary, and nominee
        [holder, beneficiary, nominee] = await Promise.all([
          contract.holder(),
          contract.beneficiary(),
          contract.nominee(),
        ]);
        prevHolder = ZERO_ADDRESS;
        prevBeneficiary = ZERO_ADDRESS;
      }

      console.log("10. Fetching endorsement chain...");
      let _endorsementChain: any[] = [];
      try {

        // Get document ID (different property names for different document types)
        const documentId = (vc as any).id || (vc as any).data?.id

        _endorsementChain = await fetchEndorsementChain(
          tokenRegistry,
          formattedTokenId,
          _provider as any,
          documentId
        );
        console.log("11. Endorsement chain fetched successfully");
      } catch (chainError: any) {
        console.warn("Failed to fetch endorsement chain (continuing without it):", chainError.message);
        console.warn("This is usually due to RPC provider block range limits. The document will still load.");
        // Continue without endorsement chain - it's not critical for document loading
      }
      console.log("12. Contract state loaded successfully");

      // Get document ID for encryption
      const encryptionId = (vc as any).id || (vc as any).data?.id || '';


      setState({
        titleEscrowAddress,
        holder,
        beneficiary,
        prevHolder,
        prevBeneficiary,
        nominee,
        encryptionId,
        endorsementChain: _endorsementChain as any,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error loading document:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n')[0]
      });
      return {
        success: false,
        error: `Failed to load document: ${error.message || 'Please check your internet connection and try again.'}`,
      };
    }
  };


  // Refresh contract state
  const refreshContractState = async () => {
    if (!state.titleEscrowAddress) {
      throw new Error("No title escrow address available");
    }

    try {
      const _provider = new providers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
      const contract = new ethers.Contract(
        state.titleEscrowAddress,
        v5Contracts.TitleEscrow__factory.abi,
        _provider
      );

      const [currentHolder, currentBeneficiary, currentNominee, currentPrevHolder, currentPrevBeneficiary] =
        await Promise.all([
          contract.holder(),
          contract.beneficiary(),
          contract.nominee(),
          contract.prevHolder(),
          contract.prevBeneficiary(),
        ]);

      setState((prev) => ({
        ...prev,
        holder: currentHolder,
        beneficiary: currentBeneficiary,
        nominee: currentNominee,
        prevHolder: currentPrevHolder,
        prevBeneficiary: currentPrevBeneficiary,
      }));

      /*
      // Refresh endorsement chain
      const savedDocument = localStorage.getItem(STORAGE_KEYS.VERIFIED_DOCUMENT);
      if (savedDocument) {
        try {
          const parsedDoc: VerifiedDocument = JSON.parse(savedDocument);
          const vc = parsedDoc.signedW3CDocument || parsedDoc;
          const _provider = new providers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
          const _endorsementChain = await fetchEndorsementChain(
            vc.credentialStatus!.tokenRegistry,
            "0x" + vc.credentialStatus!.tokenId,
            _provider as any,
            vc?.id
          );
          setState((prev) => ({
            ...prev,
            endorsementChain: _endorsementChain as any,
          }));
        } catch (chainError: any) {
          console.warn("Failed to refresh endorsement chain:", chainError.message);
          // Continue without updating endorsement chain
        }
      }
      */

      return {
        holder: currentHolder,
        beneficiary: currentBeneficiary,
        nominee: currentNominee,
        prevHolder: currentPrevHolder,
        prevBeneficiary: currentPrevBeneficiary,
      };
    } catch (error) {
      console.error("Error refreshing contract state:", error);
      throw error;
    }
  };

  // Execute contract action
  const executeAction = async (action: string) => {
    if (!signer) {
      return {
        success: false,
        error: {
          title: "Wallet Not Connected",
          message: "Please connect your MetaMask wallet first.",
        },
      };
    }

    try {
      // Validate current state
      const currentState = await refreshContractState();
      if (!currentState) {
        return {
          success: false,
          error: {
            title: "Validation Failed",
            message: "Unable to fetch current document state. Please try again.",
          },
        };
      }

      // Check permissions
      const permissionCheck = checkActionPermission(
        action,
        account,
        currentState.holder,
        currentState.beneficiary,
        currentState.prevHolder,
        currentState.prevBeneficiary,
        currentState.nominee
      );

      if (!permissionCheck.hasPermission) {
        return {
          success: false,
          error: {
            title: "Permission Denied",
            message: permissionCheck.errorMessage || "You don't have permission for this action.",
          },
        };
      }

      // Validate addresses based on action
      if (action === "transferHolder") {
        const validation = validateAddress(newHolder, "New Holder");
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              title: "Invalid Address",
              message: validation.errorMessage!,
            },
          };
        }
      } else if (action === "transferBeneficiary" || action === "nominate") {
        const validation = validateAddress(newBeneficiary, "New Beneficiary");
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              title: "Invalid Address",
              message: validation.errorMessage!,
            },
          };
        }
      } else if (action === "transferOwners") {
        const holderValidation = validateAddress(newHolder, "New Holder");
        const beneficiaryValidation = validateAddress(newBeneficiary, "New Beneficiary");

        if (!holderValidation.isValid || !beneficiaryValidation.isValid) {
          return {
            success: false,
            error: {
              title: "Invalid Address",
              message: "Please enter valid Ethereum addresses for both the new holder and beneficiary.",
            },
          };
        }
      }

      // Execute action
      const tx = await executeContractAction({
        action,
        titleEscrowAddress: state.titleEscrowAddress,
        signer,
        encryptionId: state.encryptionId,
        newHolder,
        newBeneficiary,
        remarks,
      });

      // Clear inputs after successful execution
      setNewHolder("");
      setNewBeneficiary("");
      setRemarks("");

      return {
        success: true,
        txHash: tx.hash,
        transaction: tx,
      };
    } catch (error: any) {
      console.error("Error executing action:", error);
      const { title, message } = decodeContractError(error);
      return {
        success: false,
        error: { title, message },
      };
    }
  };

  // Clear all document state
  const clearDocument = () => {
    localStorage.removeItem(STORAGE_KEYS.VERIFIED_DOCUMENT);
    localStorage.removeItem(STORAGE_KEYS.VERIFICATION_RESULT);
    setState({
      titleEscrowAddress: "",
      holder: "",
      beneficiary: "",
      prevHolder: "",
      prevBeneficiary: "",
      nominee: "",
      encryptionId: "",
      endorsementChain: [],
    });
    setNewHolder("");
    setNewBeneficiary("");
    setRemarks("");
  };

  // Generate available action buttons based on current state
  const getActionButtons = (): ActionButton[] => {
    return [
      {
        btnName: "Transfer Holder",
        action: "transferHolder",
        show: state.holder === account,
      },
      {
        btnName: "Nominate Beneficiary",
        action: "nominate",
        show: state.beneficiary === account,
      },
      {
        btnName: "Endorse Beneficiary",
        action: "transferBeneficiary",
        show: state.holder === account && state.nominee !== ZERO_ADDRESS,
      },
      {
        btnName: "Transfer Owners",
        action: "transferOwners",
        show: state.holder === account && state.beneficiary === account,
      },
      {
        btnName: "Reject Transfer Holder",
        action: "rejectTransferHolder",
        show:
          state.holder === account &&
          state.prevHolder !== ZERO_ADDRESS &&
          state.holder !== state.beneficiary,
      },
      {
        btnName: "Reject Transfer Beneficiary",
        action: "rejectTransferBeneficiary",
        show:
          state.beneficiary === account &&
          state.prevBeneficiary !== ZERO_ADDRESS &&
          state.holder !== state.beneficiary,
      },
      {
        btnName: "Reject Transfer Owners",
        action: "rejectTransferOwners",
        show:
          state.holder === state.beneficiary &&
          state.holder === account &&
          state.prevHolder !== ZERO_ADDRESS &&
          state.prevBeneficiary !== ZERO_ADDRESS,
      },
      {
        btnName: "Return to Issuer",
        action: "returnToIssuer",
        show: state.beneficiary === account && state.holder === account,
      },
    ];
  };

  return {
    ...state,
    newHolder,
    newBeneficiary,
    remarks,
    setNewHolder,
    setNewBeneficiary,
    setRemarks,
    loadDocument,
    refreshContractState,
    executeAction,
    clearDocument,
    actionButtons: getActionButtons(),
  };
}