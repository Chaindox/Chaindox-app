"use client"

import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield, FileCheck, Building2 } from "lucide-react";
import { VerificationResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VerificationStatusProps {
  verificationResult: VerificationResult;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  verificationResult,
}) => {
  const checks = [
    {
      label: "Document Integrity",
      value: verificationResult.DOCUMENT_INTEGRITY,
      icon: FileCheck,
      description: "Document has not been tampered with",
    },
    {
      label: "Document Status",
      value: verificationResult.DOCUMENT_STATUS,
      icon: Shield,
      description: "Document is currently valid and active",
    },
    {
      label: "Issuer Identity",
      value: verificationResult.ISSUER_IDENTITY,
      icon: Building2,
      description: "Issuer identity verified",
    },
  ];

  const allValid = checks.every((check) => check.value);

  return (
    <Card className="border-2 border-dashed border-gray-300 p-6 mb-6 animate-fade-in-up">
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "p-3 rounded-full",
            allValid ? "bg-green-100" : "bg-red-100"
          )}
        >
          {allValid ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Verification Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {allValid
              ? "All verification checks passed successfully"
              : "Some verification checks failed"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                check.value
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  check.value ? "text-green-600" : "text-red-600"
                )}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {check.label}
                  </span>
                  {check.value ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {check.description}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  check.value ? "text-green-700" : "text-red-700"
                )}
              >
                {check.value ? "Valid" : "Invalid"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default VerificationStatus;