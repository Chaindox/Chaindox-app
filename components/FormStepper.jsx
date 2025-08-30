import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function FormStepper({ steps, currentStep, completedSteps }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index < currentStep || completedSteps.has(index)
                      ? "bg-red-600 text-white"
                      : index === currentStep
                        ? "bg-red-100 text-red-600 border-2 border-red-600"
                        : "bg-gray-200 text-gray-500",
                  )}
                >
                  {completedSteps.has(index) ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="ml-3">
                  <p className={cn("text-sm font-medium", index === currentStep ? "text-red-600" : "text-gray-500")}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">{steps[currentStep].title}</h3>
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
