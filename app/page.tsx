"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { DocumentUpload } from "@/components/DocumentUpload"
import { CookieNotice } from "@/components/CookieNotice"
import { WarningPopup } from "@/components/WarningPopup"
import { Button } from "@/components/ui/button"
import { FileCheck } from "lucide-react"
import { verifyDocument, createDocument } from "@/app/api/verify"
import { Invoice } from "@/lib/types"

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
  const outputFile: string = 'output.json'

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

      // Call the backend API instead of client-side verification
      const result = await verifyDocument(vc);

      setVerificationResult({
        VALIDITY: result.VALIDITY,
        DOCUMENT_INTEGRITY: result.DOCUMENT_INTEGRITY,
        DOCUMENT_STATUS: result.DOCUMENT_STATUS,
        ISSUER_IDENTITY: result.ISSUER_IDENTITY,
      });

      // Store verified document in localStorage for asset management
      if (result.VALIDITY) {
        localStorage.setItem("verifiedDocument", fileContent);

        console.log(result.DOCUMENT_INTEGRITY);

        localStorage.setItem(
          "verificationResult",
          JSON.stringify({
            DOCUMENT_INTEGRITY: result.DOCUMENT_INTEGRITY,
            DOCUMENT_STATUS: result.DOCUMENT_STATUS,
            ISSUER_IDENTITY: result.ISSUER_IDENTITY,
          })
        );

        router.push("/assets");
      }

    } catch (error: unknown) {
      console.error("Verification error:", error);
      setVerificationResult(null);

      let errorMessage = "Please ensure it's a valid VC file.";
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Unable to connect to the verification server. Please ensure the backend is running on port 5000.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

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
      isLoading={isLoading}
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