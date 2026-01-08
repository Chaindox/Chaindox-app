import { CHAIN_ID, SUPPORTED_CHAINS } from "@trustvc/trustvc";
import { EndorsementActionType } from "./types";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CHAIN_CONFIG = {
  chainId: CHAIN_ID.xdc,
  get chainInfo() {
    return SUPPORTED_CHAINS[this.chainId];
  },
  get rpcUrl() {
    return this.chainInfo.rpcUrl!;
  },
};

export const ACTION_MESSAGES: Record<EndorsementActionType, string> = {
  INITIAL: "Document has been issued",
  NOMINATE: "Nomination of new beneficiary",
  REJECT_TRANSFER_BENEFICIARY: "Rejection of beneficiary",
  REJECT_TRANSFER_HOLDER: "Rejection of holdership",
  REJECT_TRANSFER_OWNERS: "Rejection of owners",
  RETURN_TO_ISSUER_ACCEPTED: "Return to issuer accepted",
  RETURN_TO_ISSUER_REJECTED: "Return to issuer rejected",
  RETURNED_TO_ISSUER: "Returned to issuer",
  SURRENDER_ACCEPTED: "Return to issuer accepted",
  SURRENDER_REJECTED: "Return to issuer rejected",
  SURRENDERED: "Returned to issuer",
  TRANSFER_BENEFICIARY: "Transfer beneficiary",
  TRANSFER_HOLDER: "Transfer holdership",
  TRANSFER_OWNERS: "Transfer beneficiary and holdership",
};

export const STORAGE_KEYS = {
  VERIFIED_DOCUMENT: "verifiedDocument",
  VERIFICATION_RESULT: "verificationResult",
} as const;

export const RENDERER_CONFIG = {
  DEFAULT_URL: "http://localhost:3003/",
  ENABLE_URL_EXTRACTION: true,
  LOG_URL_EXTRACTION: process.env.NODE_ENV === "development",
} as const;