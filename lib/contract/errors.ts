import { ContractError } from "../types";

export function decodeContractError(error: any): ContractError {
  const errorMessage = error?.message || "";
  const errorData = error?.data?.data || error?.error?.data?.data || "";

  // Check for specific error codes
  if (errorData === "0x98f83ce8") {
    return {
      title: "Permission Denied",
      message: "You don't have permission to perform this action. You may not be the current holder or beneficiary.",
    };
  }

  // Check for common revert reasons in error message
  if (errorMessage.includes("execution reverted")) {
    if (errorMessage.includes("Only holder")) {
      return {
        title: "Not Authorized",
        message: "Only the current holder can perform this action.",
      };
    }
    if (errorMessage.includes("Only beneficiary")) {
      return {
        title: "Not Authorized",
        message: "Only the current beneficiary can perform this action.",
      };
    }
    if (errorMessage.includes("Invalid state")) {
      return {
        title: "Invalid State",
        message: "This action cannot be performed in the current state of the document.",
      };
    }
  }

  // Check for insufficient gas
  if (errorMessage.includes("insufficient funds") || errorMessage.includes("gas")) {
    return {
      title: "Insufficient Funds",
      message: "You don't have enough XDC to pay for the transaction gas fees.",
    };
  }

  // Check for user rejection
  if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
    return {
      title: "Transaction Cancelled",
      message: "You cancelled the transaction in MetaMask.",
    };
  }

  // Generic execution reverted
  if (errorMessage.includes("execution reverted") || errorMessage.includes("UNPREDICTABLE_GAS_LIMIT")) {
    return {
      title: "Transaction Would Fail",
      message: "This transaction would fail. Please check that you have the correct permissions and the document state allows this action.",
    };
  }

  // Default error
  return {
    title: "Transaction Failed",
    message: errorMessage || "An unknown error occurred while processing the transaction.",
  };
}