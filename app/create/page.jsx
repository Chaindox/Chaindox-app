"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { DocumentTypeSelector } from "@/components/DocumentTypeSelector"
import { CookieNotice } from "@/components/CookieNotice"

export default function CreatePage() {
  const [showCookieNotice, setShowCookieNotice] = useState(true)
  const router = useRouter()

  const handleDocumentTypeSelect = (docType) => {
    // Store document type info in localStorage
    localStorage.setItem("selectedDocumentType", JSON.stringify(docType))

    // Generate document number with timestamp
    const timestamp = Math.floor(Date.now() / 1000)
    const documentNumber = `${docType.prefix}-${timestamp}`
    localStorage.setItem("documentNumber", documentNumber)

    // Navigate to form page
    router.push("/form")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showHomeButton />

      <DocumentTypeSelector onDocumentTypeSelect={handleDocumentTypeSelect} />

      {showCookieNotice && <CookieNotice onClose={() => setShowCookieNotice(false)} />}
    </div>
  )
}
