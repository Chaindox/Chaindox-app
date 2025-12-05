import { utils } from "ethers";
import { ZERO_ADDRESS } from "../constants";

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
  errorMessage?: string;
}

export function validateAddress(address: string, fieldName: string = "Address"): ValidationResult {
  if (!address || address.trim() === "") {
    return {
      isValid: false,
      errorMessage: `${fieldName} is required.`,
    };
  }

  if (!utils.isAddress(address)) {
    return {
      isValid: false,
      errorMessage: `Please enter a valid Ethereum address for ${fieldName.toLowerCase()}.`,
    };
  }

  return { isValid: true };
}

export function checkActionPermission(
  action: string,
  account: string,
  holder: string,
  beneficiary: string,
  prevHolder: string,
  prevBeneficiary: string,
  nominee: string
): PermissionCheck {
  const accountLower = account.toLowerCase();
  const holderLower = holder.toLowerCase();
  const beneficiaryLower = beneficiary.toLowerCase();

  switch (action) {
    case "transferHolder":
      if (holderLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be the current holder to perform this action.",
        };
      }
      break;

    case "transferBeneficiary":
      if (nominee !== ZERO_ADDRESS) {
        // When there's a nominee, holder can endorse
        if (holderLower !== accountLower) {
          return {
            hasPermission: false,
            errorMessage: "You must be the current holder to endorse the beneficiary.",
          };
        }
      } else {
        // No nominee, beneficiary can transfer
        if (beneficiaryLower !== accountLower) {
          return {
            hasPermission: false,
            errorMessage: "You must be the current beneficiary to perform this action.",
          };
        }
      }
      break;

    case "nominate":
      if (beneficiaryLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be the current beneficiary to perform this action.",
        };
      }
      break;

    case "transferOwners":
    case "returnToIssuer":
      if (holderLower !== accountLower || beneficiaryLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be both the holder and beneficiary to perform this action.",
        };
      }
      break;

    case "rejectTransferHolder":
      if (holderLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be the current holder to reject the transfer.",
        };
      }
      if (prevHolder === ZERO_ADDRESS) {
        return {
          hasPermission: false,
          errorMessage: "There is no pending holder transfer to reject.",
        };
      }
      break;

    case "rejectTransferBeneficiary":
      if (beneficiaryLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be the current beneficiary to reject the transfer.",
        };
      }
      if (prevBeneficiary === ZERO_ADDRESS) {
        return {
          hasPermission: false,
          errorMessage: "There is no pending beneficiary transfer to reject.",
        };
      }
      break;

    case "rejectTransferOwners":
      if (holderLower !== accountLower || beneficiaryLower !== accountLower) {
        return {
          hasPermission: false,
          errorMessage: "You must be both holder and beneficiary to reject transfers.",
        };
      }
      if (prevHolder === ZERO_ADDRESS || prevBeneficiary === ZERO_ADDRESS) {
        return {
          hasPermission: false,
          errorMessage: "There are no pending transfers to reject.",
        };
      }
      break;

    default:
      // For unknown actions, allow and let contract decide
      break;
  }

  return { hasPermission: true };
}