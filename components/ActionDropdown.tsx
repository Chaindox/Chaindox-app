"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/lib/types";

interface ActionDropdownProps {
  actionButtons: ActionButton[];
  onActionSelect: (action: string) => void;
  isLoading?: boolean;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actionButtons,
  onActionSelect,
  isLoading = false,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleActionClick = (action: string) => {
    onActionSelect(action);
    setDropdownVisible(false);
  };

  return (
    <div className="relative flex justify-end">
      <Button
        onClick={() => setDropdownVisible(!dropdownVisible)}
        disabled={isLoading}
        className={cn(
          "w-full md:w-48 bg-gradient-to-r from-red-600 to-orange-600",
          "hover:from-red-700 hover:to-orange-700 text-white",
          "transition-all duration-200",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? "Processing..." : "Action"}
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform duration-200",
            dropdownVisible && "rotate-180",
            isLoading && "animate-spin"
          )}
        />
      </Button>

      {dropdownVisible && !isLoading && (
        <div className="absolute top-full mt-2 w-full md:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-slide-up">
          <div className="py-1">
            {actionButtons.map((actionButton, index) => {
              return (
                actionButton.show && (
                  <button
                    key={index}
                    onClick={() => handleActionClick(actionButton.action)}
                    disabled={isLoading}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm",
                      "hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50",
                      "hover:text-red-700 transition-colors duration-150",
                      "border-b border-gray-100 last:border-b-0",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {actionButton.btnName}
                  </button>
                )
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;