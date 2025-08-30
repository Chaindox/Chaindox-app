"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/Header"
import { FormStepper } from "@/components/FormStepper"
import { FormField } from "@/components/FormField"
import { formConfig } from "@/config/formConfig"

export default function FormPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [uploadedFile, setUploadedFile] = useState(null)

  useEffect(() => {
    // Get uploaded file info from localStorage
    const fileInfo = localStorage.getItem("uploadedFile")
    if (fileInfo) {
      setUploadedFile(JSON.parse(fileInfo))
    } else {
      // If no file info, redirect to home
      router.push("/")
    }

    // Load saved form data if exists
    const savedFormData = localStorage.getItem("formData")
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
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
    const step = formConfig.steps[stepIndex]
    const requiredFields = step.fields.filter((field) => field.required)

    return requiredFields.every((field) => {
      const value = formData[field.id]
      return value !== undefined && value !== "" && value !== null
    })
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
      alert("Please fill in all required fields before proceeding.")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      localStorage.setItem("currentStep", newStep.toString())
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Store final form data for success page
    localStorage.setItem("submittedData", JSON.stringify(formData))

    // Clear form progress
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")
    localStorage.removeItem("formData")

    // Navigate to success page
    router.push("/success")
  }

  const handleClose = () => {
    // Clear all stored data
    localStorage.removeItem("uploadedFile")
    localStorage.removeItem("formData")
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")
    router.push("/")
  }

  if (!uploadedFile) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onClose={handleClose} showCloseButton />
      <FormStepper steps={formConfig.steps} currentStep={currentStep} completedSteps={completedSteps} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{currentStepConfig.title}</h1>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{currentStepConfig.description}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              Document uploaded: <span className="font-semibold text-red-600 break-all">{uploadedFile.name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {currentStepConfig.fields.map((field) => (
                <div key={field.id} className={field.type === "textarea" ? "lg:col-span-2" : ""}>
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
                    Submit Shipment Details
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
    </div>
  )
}
