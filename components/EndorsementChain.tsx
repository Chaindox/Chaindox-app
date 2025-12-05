"use client"

import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, User, FileText } from "lucide-react";
import { EndorsementChainItem } from "@/lib/types";
import { ACTION_MESSAGES } from "@/lib/constants";

interface EndorsementChainProps {
  endorsementChain: EndorsementChainItem[];
}

const EndorsementChain: React.FC<EndorsementChainProps> = ({
  endorsementChain,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      {endorsementChain.length > 0 && (
        <Card className="border-2 border-dashed border-gray-300 p-6 my-6 animate-fade-in-up animation-delay-500">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Endorsement Chain History
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Complete transaction history for this document
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Action / Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Owner
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Holder
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {endorsementChain.map((action, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {ACTION_MESSAGES[action.type]}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(action.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-600 break-all">
                        {action.owner}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-600 break-all">
                        {action.holder}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">
                        {action.remark || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {endorsementChain.map((action, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Action Type */}
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {ACTION_MESSAGES[action.type]}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(action.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          Owner
                        </div>
                        <div className="font-mono text-xs text-gray-700 break-all">
                          {action.owner}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Holder */}
                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          Holder
                        </div>
                        <div className="font-mono text-xs text-gray-700 break-all">
                          {action.holder}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  {action.remark && (
                    <div className="border-t border-gray-100 pt-2">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Remark
                      </div>
                      <div className="text-sm text-gray-700">
                        {action.remark}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
};

export default EndorsementChain;