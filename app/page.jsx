"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { DocumentUpload } from "@/components/DocumentUpload"
import { CookieNotice } from "@/components/CookieNotice"

export default function HomePage() {
  const [showCookieNotice, setShowCookieNotice] = useState(true)
  const router = useRouter()

  const handleFileUpload = (file) => {
    // Store file info in localStorage for access in form page
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }
    localStorage.setItem("uploadedFile", JSON.stringify(fileInfo))

    // Navigate to form page
    router.push("/form")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <DocumentUpload onFileUpload={handleFileUpload} />

      {showCookieNotice && <CookieNotice onClose={() => setShowCookieNotice(false)} />}
    </div>
  )
}
