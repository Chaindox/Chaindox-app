"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Eye, RotateCcw } from "lucide-react"

interface SuccessPageProps {
  uploadedFileName?: string
  companyName?: string
  onStartOver: () => void
}

export function SuccessPage({ uploadedFileName, companyName, onStartOver }: SuccessPageProps) {
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
              <span className="text-sm font-medium text-gray-900 truncate ml-4 max-w-[200px]" title={uploadedFileName}>
                {uploadedFileName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Company</span>
              <span className="text-sm font-medium text-gray-900">{companyName || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Submission ID</span>
              <span className="text-sm font-medium text-blue-600">CHX-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Processing
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in animation-delay-2500">
          <Button onClick={onStartOver} className="w-full bg-red-600 hover:bg-red-700 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Submit Another Document
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              Track Shipment
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8 animate-fade-in animation-delay-3000">
          <p className="text-sm text-gray-500">You will receive an email confirmation shortly with tracking details.</p>
        </div>
      </div>
    </div>
  )
}
