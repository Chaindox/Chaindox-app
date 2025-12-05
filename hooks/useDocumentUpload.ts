// hooks/useDocumentUpload.ts

import { useState, useEffect } from "react";
import { VerifiedDocument, VerificationResult } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

export function useDocumentUpload() {
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Load verification result from localStorage on mount
  useEffect(() => {
    const savedResult = localStorage.getItem(STORAGE_KEYS.VERIFICATION_RESULT);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setVerificationResult(parsed);
      } catch (error) {
        console.error("Error parsing verification result:", error);
      }
    }
  }, []);

  // Load document from localStorage
  const loadFromLocalStorage = (): {
    success: boolean;
    data?: VerifiedDocument;
    error?: string;
  } => {
    try {
      const savedDocument = localStorage.getItem(STORAGE_KEYS.VERIFIED_DOCUMENT);
      
      if (!savedDocument) {
        return {
          success: false,
          error: "No document found in storage",
        };
      }

      const parsedData: VerifiedDocument = JSON.parse(savedDocument);
      
      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return {
        success: false,
        error: "Failed to load document from storage",
      };
    }
  };

  const handleFileDrop = async (
    file: File
  ): Promise<{
    success: boolean;
    data?: VerifiedDocument;
    error?: string;
  }> => {
    setHasAttemptedUpload(true);

    try {
      const fileContent = await file.text();
      const parsedData: VerifiedDocument = JSON.parse(fileContent);

      // Save to localStorage for future use
      localStorage.setItem(STORAGE_KEYS.VERIFIED_DOCUMENT, fileContent);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      console.error("Error parsing document:", error);
      return {
        success: false,
        error: "Failed to parse the document. Please ensure it's a valid Verifiable Credential.",
      };
    }
  };

  const resetUploadState = () => {
    setHasAttemptedUpload(false);
  };

  const clearVerificationResult = () => {
    setVerificationResult(null);
    localStorage.removeItem(STORAGE_KEYS.VERIFICATION_RESULT);
  };

  return {
    hasAttemptedUpload,
    verificationResult,
    handleFileDrop,
    loadFromLocalStorage,
    resetUploadState,
    clearVerificationResult,
  };
}