"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssetManagement from "@/components/AssetManagement";
import EndorsementChain from "@/components/EndorsementChain";
import VerificationStatus from "@/components/VerificationStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WarningPopup } from "@/components/WarningPopup";
import { Wallet, Upload, ArrowLeft, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { WarningPopupState } from "@/lib/types";

const AssetsPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [warningPopup, setWarningPopup] = useState<WarningPopupState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Custom hooks
  const { account, signer, connectWallet } = useWallet();
  const {
    hasAttemptedUpload,
    verificationResult,
    handleFileDrop,
    loadFromLocalStorage,
    resetUploadState,
    clearVerificationResult
  } = useDocumentUpload();
  const contract = useContract(account, signer);

  // In app/assets/page.tsx - inside the useEffect
  useEffect(() => {
    const autoLoadDocument = async () => {
      // DEBUG
      console.log("Checking localStorage...");
      const savedDoc = localStorage.getItem("verifiedDocument");
      const savedResult = localStorage.getItem("verificationResult");
      console.log("Saved document:", savedDoc ? "EXISTS" : "NOT FOUND");
      console.log("Saved result:", savedResult ? "EXISTS" : "NOT FOUND");

      const loadResult = loadFromLocalStorage();
      console.log("Load result:", loadResult);

      if (loadResult.success && loadResult.data) {
        setIsLoading(true);
        console.log("Loading document into contract...");
        const contractLoadResult = await contract.loadDocument(loadResult.data);
        console.log("Contract load result:", contractLoadResult);

        if (contractLoadResult.error) {
          console.error("Contract load error:", contractLoadResult.error);
        }

        if (!contractLoadResult.success) {
          setWarningPopup({
            isOpen: true,
            title: "Error Loading Document",
            message: contractLoadResult.error || "Failed to load document. Please verify the document again.",
            type: "error",
          });
        }
        setIsLoading(false);
      }
    };

    autoLoadDocument();
  }, []);

  /*
  // Auto-load document from localStorage on mount
  useEffect(() => {
    const autoLoadDocument = async () => {
      const loadResult = loadFromLocalStorage();
      
      if (loadResult.success && loadResult.data) {
        setIsLoading(true);
        const contractLoadResult = await contract.loadDocument(loadResult.data);
        
        if (!contractLoadResult.success) {
          setWarningPopup({
            isOpen: true,
            title: "Error Loading Document",
            message: contractLoadResult.error || "Failed to load document",
            type: "error",
          });
        }
        setIsLoading(false);
      }
    };

    autoLoadDocument();
  }, []); // Run only once on mount
  */

  // Wallet connection handler
  const handleConnectWallet = async () => {
    const result = await connectWallet();
    setWarningPopup({
      isOpen: true,
      title: result.success ? "Wallet Connected" : "Connection Failed",
      message: result.message!,
      type: result.success ? "success" : "error",
    });
  };

  // File drop handler
  const onFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (!file) return;

    // Clear existing state
    contract.clearDocument();
    clearVerificationResult();
    resetUploadState();

    setIsLoading(true);

    const uploadResult = await handleFileDrop(file);

    if (uploadResult.success && uploadResult.data) {
      const loadResult = await contract.loadDocument(uploadResult.data);

      if (!loadResult.success) {
        setWarningPopup({
          isOpen: true,
          title: "Error Loading Document",
          message: loadResult.error || "Failed to load document",
          type: "error",
        });
      } else {
        setWarningPopup({
          isOpen: true,
          title: "Document Loaded",
          message: "Document has been successfully loaded. Note: This document was not verified through the verification page.",
          type: "info",
        });
      }
    } else {
      setWarningPopup({
        isOpen: true,
        title: "Invalid Document",
        message: uploadResult.error!,
        type: "error",
      });
    }

    setIsLoading(false);
  };

  // Action handler
  const handleAction = async (action: string) => {
    setIsLoading(true);

    // Show validating message
    setWarningPopup({
      isOpen: true,
      title: "Validating...",
      message: "Checking current document state...",
      type: "info",
    });

    const result = await contract.executeAction(action);

    if (result.success) {
      // Show transaction submitted
      setWarningPopup({
        isOpen: true,
        title: "Transaction Submitted",
        message: `Transaction has been submitted. Hash: ${result.txHash?.slice(0, 10)}...`,
        type: "info",
      });

      // Wait for confirmation
      await result.transaction?.wait();

      setWarningPopup({
        isOpen: true,
        title: "Transaction Successful",
        message: "The transaction has been confirmed on the blockchain.",
        type: "success",
      });

      // Refresh state
      await contract.refreshContractState();
    } else {
      setWarningPopup({
        isOpen: true,
        title: result.error!.title,
        message: result.error!.message,
        type: "error",
      });
    }

    setIsLoading(false);
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await contract.refreshContractState();
      setWarningPopup({
        isOpen: true,
        title: "Refreshed",
        message: "Contract state has been updated successfully.",
        type: "success",
      });
    } catch (error) {
      setWarningPopup({
        isOpen: true,
        title: "Refresh Failed",
        message: "Failed to refresh contract state. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear document handler
  const handleClearDocument = () => {
    contract.clearDocument();
    clearVerificationResult();
    resetUploadState();
    setWarningPopup({
      isOpen: true,
      title: "Document Cleared",
      message: "You can now upload a new document.",
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Verification
              </Button>
              {contract.titleEscrowAddress && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearDocument}
                    disabled={isLoading}
                    className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <FileX className="h-4 w-4" />
                    Upload New
                  </Button>
                </>
              )}
            </div>
            <Button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white gap-2"
            >
              <Wallet className="h-4 w-4" />
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect MetaMask"}
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Asset Management
          </h1>
          <p className="text-gray-600">
            Manage your verifiable credentials and track endorsement chains
          </p>
        </div>

        {/* Verification Status Section */}
        {verificationResult && contract.titleEscrowAddress && (
          <VerificationStatus verificationResult={verificationResult} />
        )}

        {/* Upload Section - Only show if no document is loaded */}
        {account && !contract.titleEscrowAddress && (
          <Card
            onDragOver={(e) => e.preventDefault()}
            onDrop={onFileDrop}
            className="border-2 border-dashed border-gray-300 p-12 text-center mb-6 hover:border-red-400 transition-colors duration-200 cursor-pointer animate-fade-in-up animation-delay-500"
          >
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-16 w-16 text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Drop Document
                </h2>
                <p className="text-gray-600">
                  Drop a Verifiable Credential file here to manage assets
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Or verify a document on the home page first
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  <span>Loading Document...</span>
                </div>
              )}

              {hasAttemptedUpload && !isLoading && !contract.endorsementChain.length && (
                <p className="text-red-600 font-medium">
                  Cannot load Endorsement Chain. Please try again.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Asset Management Section */}
        <AssetManagement
          titleEscrowAddress={contract.titleEscrowAddress}
          holder={contract.holder}
          beneficiary={contract.beneficiary}
          newHolder={contract.newHolder}
          newBeneficiary={contract.newBeneficiary}
          prevBeneficiary={contract.prevBeneficiary}
          prevHolder={contract.prevHolder}
          nominee={contract.nominee}
          remarks={contract.remarks}
          setNewHolder={contract.setNewHolder}
          setNewBeneficiary={contract.setNewBeneficiary}
          setRemarks={contract.setRemarks}
          handleAction={handleAction}
          actionButtons={contract.actionButtons}
          isLoading={isLoading}
        />

        {/* Endorsement Chain Section */}
        <EndorsementChain endorsementChain={contract.endorsementChain} />
      </div>

      {/* Warning Popup */}
      <WarningPopup
        isOpen={warningPopup.isOpen}
        onClose={() => setWarningPopup({ ...warningPopup, isOpen: false })}
        title={warningPopup.title}
        message={warningPopup.message}
        type={warningPopup.type}
        onConfirm={() => setWarningPopup({ ...warningPopup, isOpen: false })}
        onCancel={() => setWarningPopup({ ...warningPopup, isOpen: false })}
      />
    </div>
  );
};

export default AssetsPage;