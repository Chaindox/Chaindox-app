"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/Header"
import { FormStepper } from "@/components/FormStepper"
import { FormField } from "@/components/FormField"
import { WarningPopup } from "@/components/WarningPopup"
import { formConfigs } from "@/config/formConfigs"

export default function FormPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [selectedDocumentType, setSelectedDocumentType] = useState(null)
  const [documentNumber, setDocumentNumber] = useState("")
  const [formConfig, setFormConfig] = useState(null)
  const [warningPopup, setWarningPopup] = useState({ isOpen: false, title: "", message: "", type: "warning" })

  const showWarning = (title, message, type = "warning") => {
    setWarningPopup({ isOpen: true, title, message, type })
  }

  const closeWarning = () => {
    setWarningPopup({ isOpen: false, title: "", message: "", type: "warning" })
  }

  useEffect(() => {
    // Get document type info from localStorage
    const docTypeInfo = localStorage.getItem("selectedDocumentType")
    const docNumber = localStorage.getItem("documentNumber")

    if (docTypeInfo && docNumber) {
      const docType = JSON.parse(docTypeInfo)
      setSelectedDocumentType(docType)
      setDocumentNumber(docNumber)
      setFormConfig(formConfigs[docType.id])

      // Pre-fill document number in form data based on document type
      const numberFieldMap = {
        invoice: "invoice_number",
        "purchase-order": "poNumber",
        "bill-of-lading": "bolNumber",
        "packing-list": "packingListNumber",
        "certificate-of-origin": "certificateNumber",
      }

      const numberField = numberFieldMap[docType.id]
      if (numberField) {
        setFormData((prev) => ({ ...prev, [numberField]: docNumber }))
      }
    } else {
      // If no document type selected, redirect to home
      router.push("/")
    }

    // Load saved form data if exists
    const savedFormData = localStorage.getItem("formData")
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData)
      setFormData((prev) => ({ ...prev, ...parsed }))
    }

    const savedStep = localStorage.getItem("currentStep")
    if (savedStep) {
      setCurrentStep(Number.parseInt(savedStep))
    }

    const savedCompletedSteps = localStorage.getItem("completedSteps")
    if (savedCompletedSteps) {
      setCompletedSteps(new Set(JSON.parse(savedCompletedSteps)))
    }
  }, [router])

  const updateFormData = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    // Auto-save form data
    localStorage.setItem("formData", JSON.stringify(newFormData))
  }

  const validateStep = (stepIndex) => {
    if (!formConfig) return false

    const step = formConfig.steps[stepIndex]
    const requiredFields = step.fields.filter((field) => field.required)

    return requiredFields.every((field) => {
      const value = formData[field.id]
      return value !== undefined && value !== "" && value !== null
    })
  }

  const getIncompleteFields = (stepIndex) => {
    if (!formConfig) return []

    const step = formConfig.steps[stepIndex]
    const requiredFields = step.fields.filter((field) => field.required)

    return requiredFields
      .filter((field) => {
        const value = formData[field.id]
        return value === undefined || value === "" || value === null
      })
      .map((field) => field.label)
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const newCompletedSteps = new Set([...completedSteps, currentStep])
      setCompletedSteps(newCompletedSteps)

      if (currentStep < formConfig.steps.length - 1) {
        const newStep = currentStep + 1
        setCurrentStep(newStep)
        // Save progress
        localStorage.setItem("currentStep", newStep.toString())
        localStorage.setItem("completedSteps", JSON.stringify([...newCompletedSteps]))
      }
    } else {
      const incompleteFields = getIncompleteFields(currentStep)
      showWarning(
        "Required Fields Missing",
        `Please fill in the following required fields before proceeding:• ${incompleteFields.join(" • ")}`,
        "warning",
      )
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      localStorage.setItem("currentStep", newStep.toString())
    }
  }

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const transformToOpenAttestationFormat = (formData, documentType, documentNumber) => {
    // Generate UUIDs for each field
    const generateFieldWithUUID = (value, type = "string") => {
      return `${generateUUID()}:${type}:${value}`
    }

    // Transform form data based on document type
    let transformedData = {}

    if (documentType.id === "invoice") {
      transformedData = {
        invoice_number: generateFieldWithUUID(formData.invoice_number || documentNumber),
        issue_date: generateFieldWithUUID(formData.issue_date || ""),
        invoice_date: generateFieldWithUUID(formData.invoice_date || ""),
        payment_due_date: generateFieldWithUUID(formData.payment_due_date || ""),
        buyer: {
          name: generateFieldWithUUID(formData.buyer_name || ""),
          address: generateFieldWithUUID(formData.buyer_address || ""),
        },
        invoicee: {
          name: generateFieldWithUUID(formData.invoicee_name || ""),
          address: generateFieldWithUUID(formData.invoicee_address || ""),
        },
        sellers_bank: {
          name: generateFieldWithUUID(formData.sellers_bank_name || ""),
          swift_code: generateFieldWithUUID(formData.sellers_bank_swift_code || ""),
        },
        seller: {
          name: generateFieldWithUUID(formData.seller_name || ""),
          address: generateFieldWithUUID(formData.seller_address || ""),
          tax_id: generateFieldWithUUID(formData.seller_tax_id || ""),
        },
        seller_bank_account: generateFieldWithUUID(formData.seller_bank_account || ""),
        invoice_amount: generateFieldWithUUID(formData.invoice_amount || 0, "number"),
      }
    } else {
      // For other document types, transform all fields generically
      Object.keys(formData).forEach((key) => {
        const value = formData[key]
        const type = typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string"
        transformedData[key] = generateFieldWithUUID(value, type)
      })
    }

    // Generate a random hash for signature
    const generateRandomHash = () => {
      return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    }

    const targetHash = generateRandomHash()

    return {
      version: "https://schema.openattestation.com/2.0/schema.json",
      data: {
        $template: {
          name: generateFieldWithUUID("main"),
          type: generateFieldWithUUID("EMBEDDED_RENDERER"),
          url: generateFieldWithUUID("https://tutorial-renderer.openattestation.com"),
        },
        recipient: {
          name: generateFieldWithUUID("ChainDox"),
        },
        issuers: [
          {
            name: generateFieldWithUUID("ChainDox Issuer"),
            documentStore: generateFieldWithUUID("0x2E045A7aB513d1129636d9894fFB386f6e0A46b8"),
            identityProof: {
              type: generateFieldWithUUID("DNS-TXT"),
              location: generateFieldWithUUID("chaindox.openattestation.com"),
            },
          },
        ],
        data: {
          document_code: generateFieldWithUUID(documentType.name),
          data: transformedData,
          draft: generateFieldWithUUID(false, "boolean"),
        },
      },
      signature: {
        type: "SHA3MerkleProof",
        targetHash: targetHash,
        proof: [],
        merkleRoot: targetHash,
      },
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Validate final step before submission
    if (!validateStep(currentStep)) {
      const incompleteFields = getIncompleteFields(currentStep)
      showWarning(
        "Cannot Submit Document",
        `Please fill in the following required fields before submitting:• ${incompleteFields.join(" • ")}`,
        "error",
      )
      return
    }

    // Transform data to OpenAttestation format
    const openAttestationData = transformToOpenAttestationFormat(formData, selectedDocumentType, documentNumber)

    // Create comprehensive document data for display
    const documentData = {
      documentType: selectedDocumentType,
      documentNumber: documentNumber,
      data: openAttestationData,
      createdAt: new Date().toISOString(),
      version: "1.0",
      status: "completed",
    }

    // Store final document data for success page
    localStorage.setItem("completedDocument", JSON.stringify(documentData))

    // Clear form progress
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")
    localStorage.removeItem("formData")

    // Navigate to success page
    router.push("/success")
  }

  const handleClose = () => {
    showWarning(
      "Discard Changes?",
      "Are you sure you want to close this form? All unsaved changes will be lost.",
      "warning",
      true, // showCancel
    )
  }

  const confirmClose = () => {
    // Clear all stored data
    localStorage.removeItem("selectedDocumentType")
    localStorage.removeItem("documentNumber")
    localStorage.removeItem("formData")
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")
    closeWarning()
    router.push("/")
  }

  if (!selectedDocumentType || !formConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const currentStepConfig = formConfig.steps[currentStep]
  const isLastStep = currentStep === formConfig.steps.length - 1

  // Calculate grid layout
  const fields = currentStepConfig.fields
  const gridFields = []

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if (field.type === "textarea") {
      // Textarea fields take full width
      gridFields.push({ field, span: "full" })
    } else {
      // Check if this is the last field and it's odd
      const remainingFields = fields.slice(i).filter((f) => f.type !== "textarea")
      if (remainingFields.length === 1) {
        gridFields.push({ field, span: "full" })
      } else {
        gridFields.push({ field, span: "half" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onClose={handleClose} showCloseButton />
      <FormStepper steps={formConfig.steps} currentStep={currentStep} completedSteps={completedSteps} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{selectedDocumentType.icon}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{currentStepConfig.title}</h1>
            </div>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{currentStepConfig.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
              <p className="text-xs sm:text-sm text-gray-500">
                Document Type: <span className="font-semibold text-red-600">{selectedDocumentType.name}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Document Number: <span className="font-semibold text-blue-600">{documentNumber}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {gridFields.map(({ field, span }, index) => (
                <div key={field.id} className={span === "full" ? "md:col-span-2" : ""}>
                  <FormField
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => updateFormData(field.id, value)}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-6 border-t space-y-4 sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="w-full sm:w-auto bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-transparent"
                >
                  Cancel
                </Button>
                {isLastStep ? (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 w-full sm:w-auto"
                  >
                    Create {selectedDocumentType.name}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 w-full sm:w-auto"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      <WarningPopup
        isOpen={warningPopup.isOpen}
        onClose={closeWarning}
        title={warningPopup.title}
        message={warningPopup.message}
        type={warningPopup.type}
        showCancel={warningPopup.title === "Discard Changes?"}
        confirmText={warningPopup.title === "Discard Changes?" ? "Discard" : "OK"}
        onConfirm={warningPopup.title === "Discard Changes?" ? confirmClose : closeWarning}
        onCancel={closeWarning}
      />
    </div>
  )
}