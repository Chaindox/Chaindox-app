"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { DocumentUpload } from "@/components/DocumentUpload"
import { CookieNotice } from "@/components/CookieNotice"
import { WarningPopup } from "@/components/WarningPopup"

export default function HomePage() {
  const [showCookieNotice, setShowCookieNotice] = useState(true)
  const [warningPopup, setWarningPopup] = useState({ isOpen: false, title: "", message: "", type: "info" })
  const router = useRouter()

  const showWarning = (title, message, type = "info") => {
    setWarningPopup({ isOpen: true, title, message, type })
  }

  const closeWarning = () => {
    setWarningPopup({ isOpen: false, title: "", message: "", type: "info" })
  }

  const handleFileUpload = (file) => {
    // Store file info in localStorage for access in verification
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }
    localStorage.setItem("uploadedFile", JSON.stringify(fileInfo))

    // Show info popup instead of alert
    showWarning(
      "Feature Coming Soon",
      "Document verification functionality will be implemented soon! Your file has been uploaded successfully.",
      "info",
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <DocumentUpload onFileUpload={handleFileUpload} />

      {showCookieNotice && <CookieNotice onClose={() => setShowCookieNotice(false)} />}

      <WarningPopup
        isOpen={warningPopup.isOpen}
        onClose={closeWarning}
        title={warningPopup.title}
        message={warningPopup.message}
        type={warningPopup.type}
      />
    </div>
  )
}
