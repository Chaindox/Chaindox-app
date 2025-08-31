"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Info, CheckCircle, XCircle } from "lucide-react"
import { useEffect } from "react"

export function WarningPopup({
  isOpen,
  onClose,
  title,
  message,
  type = "warning", // warning, error, info, success
  confirmText = "OK",
  showCancel = false,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "error":
        return <XCircle className="w-6 h-6 text-red-600" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case "error":
        return "text-red-800"
      case "success":
        return "text-green-800"
      case "info":
        return "text-blue-800"
      default:
        return "text-orange-800"
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  // Format message for better readability
  const formatMessage = (msg) => {
    if (msg.includes("•")) {
      // Split by bullet points and format as a proper list
      const parts = msg.split("•").filter((part) => part.trim())
      const mainText = parts[0].trim()
      const listItems = parts
        .slice(1)
        .map((item) => item.trim())
        .filter((item) => item)

      return (
        <div>
          <p className="text-gray-700 mb-3">{mainText}</p>
          {listItems.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <ul className="space-y-1">
                {listItems.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    return <p className="text-gray-700">{msg}</p>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
        style={{
          animation: isOpen ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-out",
        }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300"
        style={{
          animation: isOpen ? "slideInScale 0.3s ease-out" : "slideOutScale 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-lg font-semibold ${getTitleColor()}`}>
              {title ||
                (type === "error"
                  ? "Error"
                  : type === "success"
                    ? "Success"
                    : type === "info"
                      ? "Information"
                      : "Warning")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">{formatMessage(message)}</div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {showCancel && (
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto bg-transparent">
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className={`w-full sm:w-auto ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : type === "info"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideInScale {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideOutScale {
          from { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to { 
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
