"use client"

import { Button } from "@/components/ui/button"
import { Settings, X, Menu, Home } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Header({ onClose, showCloseButton = false, showHomeButton = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleHomeClick = () => {
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button onClick={handleHomeClick} className="flex items-center space-x-1 hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl font-bold text-black">Chain</span>
            <span className="text-xl sm:text-2xl font-bold text-red-600">Do</span>
            <span className="text-xl sm:text-2xl font-bold text-black">X</span>
          </button>
          <div className="hidden sm:block text-xs text-gray-600">
            <div>
              Your Data made <span className="text-red-600 font-semibold">Secure</span> and{" "}
              <span className="text-red-600 font-semibold">Transferable</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-3">
          {showHomeButton && (
            <Button variant="ghost" size="icon" onClick={handleHomeClick}>
              <Home className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          {!showCloseButton && (
            <>
              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 bg-white/80">
                Create Doc
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">Verify Doc</Button>
            </>
          )}
          {showCloseButton && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex items-center space-x-2">
          {showHomeButton && (
            <Button variant="ghost" size="icon" onClick={handleHomeClick}>
              <Home className="w-5 h-5" />
            </Button>
          )}
          {showCloseButton && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 mt-4 pt-4">
          <div className="flex flex-col space-y-2 max-w-7xl mx-auto">
            <div className="text-xs text-gray-600 mb-2">
              Your Data made <span className="text-red-600 font-semibold">Secure</span> and{" "}
              <span className="text-red-600 font-semibold">Transferable</span>
            </div>
            {!showCloseButton && (
              <>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 w-full bg-transparent">
                  Create Doc
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 w-full">Verify Doc</Button>
              </>
            )}
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
