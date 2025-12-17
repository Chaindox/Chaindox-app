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
import { createDocument } from "@/app/api/verify"

export default function FormPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [selectedDocumentType, setSelectedDocumentType] = useState(null)
  const [documentNumber, setDocumentNumber] = useState("")
  const [formConfig, setFormConfig] = useState(null)
  const [warningPopup, setWarningPopup] = useState({ isOpen: false, title: "", message: "", type: "warning" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

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

      // Pre-fill document ID fields in form data based on document type
      const idFieldMap = {
        "electronic-promissory-note": "epnId",
        "warehouse-receipt": "wrId",
        "bill-of-lading": "bolId",
        "invoice": "invoiceId",
        "certificate-of-origin": "cooId",
      }

      const idField = idFieldMap[docType.id]
      if (idField) {
        setFormData((prev) => ({ ...prev, [idField]: docNumber }))
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

  const numberToWords = (num) => {
    if (num === 0) return "Zero"
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return ""
      
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) {
        const ten = Math.floor(n / 10)
        const one = n % 10
        return tens[ten] + (one ? " " + ones[one] : "")
      }
      
      const hundred = Math.floor(n / 100)
      const remainder = n % 100
      return ones[hundred] + " Hundred" + (remainder ? " " + convertLessThanThousand(remainder) : "")
    }
    
    if (num < 1000) return convertLessThanThousand(num)
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000)
      const remainder = num % 1000
      return convertLessThanThousand(thousands) + " Thousand" + (remainder ? " " + convertLessThanThousand(remainder) : "")
    }
    if (num < 1000000000) {
      const millions = Math.floor(num / 1000000)
      const remainder = num % 1000000
      let result = convertLessThanThousand(millions) + " Million"
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000)
        result += " " + convertLessThanThousand(thousands) + " Thousand"
        remainder = remainder % 1000
      }
      if (remainder > 0) {
        result += " " + convertLessThanThousand(remainder)
      }
      return result
    }
    
    return num.toString() // Fallback for very large numbers
  }

  const updateFormData = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-calculate invoice fields
    if (selectedDocumentType?.id === "invoice") {
      // Calculate amount from quantity and rate
      if (field === "billableItemsQuantity" || field === "billableItemsRate") {
        const quantity = field === "billableItemsQuantity" ? value : (newFormData.billableItemsQuantity || 0)
        const rate = field === "billableItemsRate" ? value : (newFormData.billableItemsRate || 0)
        newFormData.billableItemsAmount = Number(quantity) * Number(rate)
      }
      
      // Calculate subtotal from amount
      if (field === "billableItemsAmount" || field === "billableItemsQuantity" || field === "billableItemsRate") {
        newFormData.subtotal = newFormData.billableItemsAmount || 0
      }
      
      // Calculate tax total when tax rate or subtotal changes
      if (field === "tax" || field === "subtotal" || field === "billableItemsAmount" || field === "billableItemsQuantity" || field === "billableItemsRate") {
        const subtotal = newFormData.subtotal || 0
        const taxRate = field === "tax" ? value : (newFormData.tax || 0)
        newFormData.taxTotal = (Number(subtotal) * Number(taxRate)) / 100
      }
      
      // Calculate total (subtotal + taxTotal)
      if (field === "tax" || field === "subtotal" || field === "billableItemsAmount" || field === "billableItemsQuantity" || field === "billableItemsRate") {
        const subtotal = newFormData.subtotal || 0
        const taxTotal = newFormData.taxTotal || 0
        newFormData.total = Number(subtotal) + Number(taxTotal)
      }
    }
    
    // Auto-calculate Electronic Promissory Note fields
    if (selectedDocumentType?.id === "electronic-promissory-note") {
      // Calculate total amount payable (principal + interest)
      if (field === "principalAmount" || field === "interestRate") {
        const principal = field === "principalAmount" ? Number(value) : Number(newFormData.principalAmount || 0)
        const interestRate = field === "interestRate" ? Number(value) : Number(newFormData.interestRate || 0)
        const interestAmount = (principal * interestRate) / 100
        newFormData.totalAmountPayable = principal + interestAmount
      }
      
      // Auto-convert principal amount to words
      if (field === "principalAmount") {
        const principal = Number(value) || 0
        if (principal > 0) {
          newFormData.amountInWords = numberToWords(principal)
        } else {
          newFormData.amountInWords = ""
        }
      }
    }
    
    // Auto-calculate Warehouse Receipt fields
    if (selectedDocumentType?.id === "warehouse-receipt") {
      // Calculate total charges
      if (field === "storageCharges" || field === "handlingCharges" || field === "otherCharges") {
        const storage = Number(newFormData.storageCharges || 0)
        const handling = Number(newFormData.handlingCharges || 0)
        const other = Number(newFormData.otherCharges || 0)
        newFormData.totalCharges = storage + handling + other
      }
    }
    
    // Auto-calculate Bill of Lading fields
    if (selectedDocumentType?.id === "bill-of-lading") {
      // Calculate collect charges (freight - prepaid)
      if (field === "freightCharges" || field === "prepaidAmount") {
        const freight = Number(newFormData.freightCharges || 0)
        const prepaid = Number(newFormData.prepaidAmount || 0)
        newFormData.collectCharges = freight - prepaid
      }
    }
    
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
        setCanSubmit(false) // Reset submit permission when navigating
        // Save progress
        localStorage.setItem("currentStep", newStep.toString())
        localStorage.setItem("completedSteps", JSON.stringify([...newCompletedSteps]))
        
        // Allow submission after a short delay to prevent auto-submit
        setTimeout(() => {
          setCanSubmit(true)
        }, 300)
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

  // Map document type IDs to DocumentId enum values
  const getDocumentId = (docTypeId) => {
    const documentIdMap = {
      "electronic-promissory-note": "ELECTRONIC_PROMISSORY_NOTE",
      "warehouse-receipt": "WAREHOUSE_RECEIPT",
      "bill-of-lading": "BILL_OF_LADING",
      "invoice": "INVOICE",
      "certificate-of-origin": "CERTIFICATE_OF_ORIGIN",
    }
    return documentIdMap[docTypeId] || "SAMPLE"
  }

  // Transform form data to match the document interface structure
  const transformToCredentialSubject = (formData, docTypeId) => {
    // Create a clean object with the form data, excluding blockchain fields
    const { owner, holder, remarks, ownerAddress, holderAddress, ...cleanFormData } = formData
    const credentialSubject = { ...cleanFormData }
    
    // Add document-specific ID field if not present
    const docIdField = {
      "electronic-promissory-note": "epnId",
      "warehouse-receipt": "wrId",
      "bill-of-lading": "bolId",
      "invoice": "invoiceId",
      "certificate-of-origin": "cooId",
    }
    
    const idField = docIdField[docTypeId]
    if (idField && !credentialSubject[idField]) {
      credentialSubject[idField] = documentNumber
    }
    
    return credentialSubject
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Ensure we're on the last step before allowing submission
    if (!isLastStep) {
      return
    }

    // Prevent auto-submission when just navigating to last step
    if (!canSubmit) {
      return
    }

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

    setIsSubmitting(true)

    try {
      // Transform form data to credential subject
      const credentialSubject = transformToCredentialSubject(formData, selectedDocumentType.id)

      // Get the DocumentId enum value
      const documentId = getDocumentId(selectedDocumentType.id)

      // Get owner and holder from form data or use default valid addresses
      // IMPORTANT: Zero addresses (0x0000...) will be rejected by the smart contract
      const defaultAddress = "0x8e215d06ea7ec1fdb4fc5fd21768f4b34ee92ef4"
      const ownerAddress = formData.ownerAddress || formData.owner || defaultAddress
      const holderAddress = formData.holderAddress || formData.holder || defaultAddress

      // Prepare the request payload with valid addresses
      const payload = {
        credentialSubject: credentialSubject,
        owner: ownerAddress,
        holder: holderAddress,
        remarks: formData.remarks || `Created ${selectedDocumentType.name} - ${documentNumber}`,
      }

      console.log('Submitting document:', { documentId, payload })

      // Call the API
      const result = await createDocument(documentId, payload)

      if (result.success && result.data) {
        // Create comprehensive document data for display
        const documentData = {
          documentType: selectedDocumentType,
          documentNumber: documentNumber,
          formData: formData, // Store original form inputs
          signedDocument: result.data.signedW3CDocument, // Store the signed W3C document
          transactionHash: result.data.transactionHash,
          tokenId: result.data.tokenId,
          createdAt: new Date().toISOString(),
          version: "1.0",
          status: "completed",
        }

        console.log('Document created successfully:', documentData)

        // Store final document data for success page
        localStorage.setItem("completedDocument", JSON.stringify(documentData))

        // Clear form progress
        localStorage.removeItem("currentStep")
        localStorage.removeItem("completedSteps")
        localStorage.removeItem("formData")

        // Navigate to success page
        router.push("/success")
      } else {
        // Show error with more details
        console.error('Document creation failed:', result)
        const errorMessage = result.error || "An error occurred while creating the document. Please try again."
        
        // Extract user-friendly message
        let displayMessage = errorMessage
        if (errorMessage.includes('not supported')) {
          displayMessage = `Document type is not supported by the backend. Please contact support.`
        } else if (errorMessage.includes('required')) {
          displayMessage = `Missing required fields. ${errorMessage}`
        } else if (errorMessage.includes('validation')) {
          displayMessage = `Document validation failed. Please check your input data.`
        } else if (errorMessage.includes('minting') || errorMessage.includes('blockchain')) {
          displayMessage = `Blockchain transaction failed. Please check owner/holder addresses and try again.`
        } else if (errorMessage.includes('configuration') || errorMessage.includes('Wallet')) {
          displayMessage = `Server configuration error. Please contact administrator.`
        }
        
        showWarning(
          "Document Creation Failed",
          displayMessage,
          "error",
        )
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error creating document:", error)
      showWarning(
        "Document Creation Failed",
        `An unexpected error occurred: ${error.message}\n\nPlease ensure the backend server is running at http://localhost:5000`,
        "error",
      )
      setIsSubmitting(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header onClose={handleClose} showCloseButton />
      <FormStepper steps={formConfig.steps} currentStep={currentStep} completedSteps={completedSteps} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Document Info Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-lg p-2 shadow-md">
                <span className="text-3xl">{selectedDocumentType.icon}</span>
              </div>
              <div className="text-white">
                <h2 className="text-sm font-medium opacity-90">Creating</h2>
                <h1 className="text-2xl font-bold">{selectedDocumentType.name}</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Document Number</p>
              <p className="text-lg font-mono font-semibold text-white">{documentNumber}</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-b-xl shadow-xl border-t-2 border-orange-500">
          {/* Step Title Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{currentStepConfig.title}</h2>
            <p className="text-gray-600 text-sm">{currentStepConfig.description}</p>
          </div>

          {/* Form Fields */}
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              // Prevent Enter key from submitting the form
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault()
              }
            }}
            className="p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridFields.map(({ field, span }, index) => (
                <div 
                  key={field.id} 
                  className={`${span === "full" ? "md:col-span-2" : ""} transition-all duration-200 hover:scale-[1.01]`}
                >
                  <FormField
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => updateFormData(field.id, value)}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-8 mt-8 border-t-2 border-gray-100 space-y-4 sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="w-full sm:w-auto bg-transparent hover:bg-gray-50 border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-transparent hover:bg-red-50 border-red-300 text-red-600 hover:text-red-700 shadow-sm"
                >
                  Cancel
                </Button>
                {isLastStep ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Document...
                      </>
                    ) : (
                      <>
                        <span>Create {selectedDocumentType.name}</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                  >
                    Continue
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
