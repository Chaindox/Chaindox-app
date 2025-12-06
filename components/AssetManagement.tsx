"use client"

import React, { Dispatch, SetStateAction } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ActionDropdown from "@/components/ActionDropdown";
import { ActionButton } from "@/lib/types";

type AssetManagementProps = {
  titleEscrowAddress: string;
  holder: string;
  beneficiary: string;
  newHolder: string;
  newBeneficiary: string;
  prevBeneficiary: string;
  prevHolder: string;
  nominee: string;
  remarks: string;
  setNewHolder: Dispatch<SetStateAction<string>>;
  setNewBeneficiary: Dispatch<SetStateAction<string>>;
  setRemarks: Dispatch<SetStateAction<string>>;
  handleAction: (action: string) => Promise<void>;
  actionButtons: ActionButton[];
  isLoading?: boolean;
};

const AssetManagement: React.FC<AssetManagementProps> = ({
  titleEscrowAddress,
  holder,
  beneficiary,
  newHolder,
  newBeneficiary,
  prevBeneficiary,
  prevHolder,
  nominee,
  remarks,
  setNewHolder,
  setNewBeneficiary,
  setRemarks,
  handleAction,
  actionButtons,
  isLoading = false,
}) => {
  return (
    <>
      {holder && beneficiary && (
        <Card className="border-2 border-dashed border-gray-300 p-6 my-6 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Left Section - Asset Information */}
            <div className="flex-1 space-y-3 text-sm">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Asset Information
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Title Escrow:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {titleEscrowAddress}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Holder:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {holder}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Beneficiary:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {beneficiary}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Nominee:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {nominee}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Previous Beneficiary:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {prevBeneficiary}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-semibold text-gray-700 min-w-[160px]">
                    Previous Holder:
                  </span>
                  <span className="text-gray-600 break-all font-mono text-xs">
                    {prevHolder}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> The previous beneficiary and holder are
                  the addresses from the most recent transfer of the holder,
                  beneficiary, or both. Their presence determines whether the
                  reject action is available for this transfer.
                </p>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex-1 w-full lg:max-w-2xl">
              <div className="space-y-4">
                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="text"
                    placeholder="New Holder"
                    value={newHolder}
                    onChange={(e) => setNewHolder(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder="New Beneficiary"
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Action Dropdown Component */}
                <ActionDropdown
                  actionButtons={actionButtons}
                  onActionSelect={handleAction}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AssetManagement;