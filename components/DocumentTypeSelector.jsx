"use client"

import { Card } from "@/components/ui/card"
import { Plus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { documentTypes } from "@/config/documentTypes"
import { Button } from "@/components/ui/button"

export function DocumentTypeSelector({ onDocumentTypeSelect }) {
  const router = useRouter()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-800 p-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Document Verification
        </Button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12 text-center sm:text-left">
        Create ChainDoX Document
      </h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Select Document Type</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Choose the type of document you want to create. Each document type has its own specialized form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {documentTypes.map((docType) => (
          <Card
            key={docType.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-400 bg-white"
            onClick={() => onDocumentTypeSelect(docType)}
          >
            <div className="text-center space-y-4">
              {/* Document Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{docType.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{docType.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{docType.description}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {docType.prefix}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
