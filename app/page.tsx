"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { DocumentUpload } from "@/components/DocumentUpload"
import { CookieNotice } from "@/components/CookieNotice"
import { WarningPopup } from "@/components/WarningPopup"

export default function HomePage() {
  const [showCookieNotice, setShowCookieNotice] = useState(true)
  const [warningPopup, setWarningPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "success";
  }>({ isOpen: false, title: "", message: "", type: "info" })
  const [verificationResult, setVerificationResult] = useState<{
    VALIDITY: boolean,
    DOCUMENT_INTEGRITY: boolean,
    DOCUMENT_STATUS: boolean,
    ISSUER_IDENTITY: boolean,
  } | null>(null);
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const showWarning = (title: string, message: string, type: "info" | "error" | "success" = "info") => {
    setWarningPopup({ isOpen: true, title, message, type })
  }

  const closeWarning = () => {
    setWarningPopup({ isOpen: false, title: "", message: "", type: "info" })
  }

  const handleFileUpload = async (file: File) => {
    setHasAttemptedUpload(true);
    setIsLoading(true);

    if(!file) {
      setIsLoading(false);
      return;
    }

    try {
      const fileContent = await file.text();
      const vc = JSON.parse(fileContent);

      const { isValid, verifyDocument } = await import("@trustvc/trustvc");
      const rpc = "https://rpc.ankr.com/xdc";
      const fragments = await verifyDocument(vc, rpc);
      const result = isValid(fragments);
      const documentIntegrity = isValid(fragments, ["DOCUMENT_INTEGRITY"]);
      const documentStatus = isValid(fragments, ["DOCUMENT_STATUS"]);
      const issuerIdentity = isValid(fragments, ["ISSUER_IDENTITY"]);

      setVerificationResult({
        VALIDITY: result,
        DOCUMENT_INTEGRITY: documentIntegrity,
        DOCUMENT_STATUS: documentStatus,
        ISSUER_IDENTITY: issuerIdentity,
      });

      const resultMessage = `
        Overall Validity: ${result ? "✓ Valid" : "✗ Invalid"}
        
        Document Integrity: ${documentIntegrity ? "✓ Valid" : "✗ Invalid"}
        Document Status: ${documentStatus ? "✓ Valid" : "✗ Invalid"}
        Issuer Identity: ${issuerIdentity ? "✓ Valid" : "✗ Invalid"}
      `;

      showWarning(
        result ? "Verification Successful" : "Verification Failed",
        resultMessage,
        result ? "success" : "error"
      );

    } catch (error: unknown) {
      console.error("Verification error:", error);
      setVerificationResult(null);
      
      const errorMessage = error instanceof Error ? error.message : "Please ensure it's a valid VC file.";
      
      showWarning(
        "Verification Error",
        `Unable to verify the document. ${errorMessage}`,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-50">
    <Header onClose={() => {}} />

    <DocumentUpload 
      onFileUpload={handleFileUpload}
    />

    {showCookieNotice && <CookieNotice onClose={() => setShowCookieNotice(false)} />}

    <WarningPopup
      isOpen={warningPopup.isOpen}
      onClose={closeWarning}
      title={warningPopup.title}
      message={warningPopup.message}
      type={warningPopup.type}
      onConfirm={closeWarning}
      onCancel={closeWarning}
    />
  </div>
)
}