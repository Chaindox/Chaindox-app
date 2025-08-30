"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState(null)
  const [submittedData, setSubmittedData] = useState({})

  useEffect(() => {
    // Get data from localStorage
    const fileInfo = localStorage.getItem("uploadedFile")
    const formData = localStorage.getItem("submittedData")

    if (fileInfo) {
      setUploadedFile(JSON.parse(fileInfo))
    }

    if (formData) {
      setSubmittedData(JSON.parse(formData))
    }

    // If no data found, redirect to home
    if (!fileInfo || !formData) {
      router.push("/")
    }
  }, [router])

  const handleStartOver = () => {
    // Clear all stored data
    localStorage.removeItem("uploadedFile")
    localStorage.removeItem("submittedData")
    localStorage.removeItem("formData")
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")

    // Navigate to home
    router.push("/")
  }

  if (!uploadedFile || !submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-fade-in">
            <CheckCircle className="w-12 h-12 text-green-600 animate-fade-in-up animation-delay-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-fade-in-up animation-delay-1000">
            Submission Successful!
          </h1>
          <p className="text-gray-600 animate-fade-in-up animation-delay-1500">
            Your shipment details have been successfully submitted and are now being processed.
          </p>
        </div>

        {/* Submission Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-slide-up animation-delay-2000">
          <h3 className="font-semibold text-gray-900 mb-4">Submission Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Document</span>
              <span className="text-sm font-medium text-gray-900 truncate ml-4 max-w-[200px]" title={uploadedFile.name}>
                {uploadedFile.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Company</span>
              <span className="text-sm font-medium text-gray-900">{submittedData.companyName || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Submission ID</span>
              <span className="text-sm font-medium text-blue-600">CHX-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Contact</span>
              <span className="text-sm font-medium text-gray-900">{submittedData.email || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Processing
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="animate-fade-in animation-delay-2500">
          <Button onClick={handleStartOver} className="w-full bg-red-600 hover:bg-red-700 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Submit Another Document
          </Button>
        </div>
      </div>
    </div>
  )
}
