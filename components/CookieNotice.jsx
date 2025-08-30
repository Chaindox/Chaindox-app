"use client"

import { Button } from "@/components/ui/button"

export function CookieNotice({ onClose }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm space-y-3 sm:space-y-0">
        <p className="text-gray-700 flex-1">
          To offer you a better experience, this site uses cookies. Read more about cookies in our{" "}
          <button className="text-red-600 hover:text-red-800 underline">Privacy Statement</button>
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto sm:ml-4 bg-transparent">
          Close
        </Button>
      </div>
    </div>
  )
}
