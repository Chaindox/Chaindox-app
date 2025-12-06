// lib/contract/actions.ts

import { ethers, Signer } from "ethers";
import { v5Contracts, encrypt } from "@trustvc/trustvc";

export interface ExecuteActionParams {
  action: string;
  titleEscrowAddress: string;
  signer: Signer;
  encryptionId: string;
  newHolder?: string;
  newBeneficiary?: string;
  remarks?: string;
}

export async function executeContractAction({
  action,
  titleEscrowAddress,
  signer,
  encryptionId,
  newHolder = "",
  newBeneficiary = "",
  remarks = "",
}: ExecuteActionParams) {
  const contract = new ethers.Contract(
    titleEscrowAddress,
    v5Contracts.TitleEscrow__factory.abi,
    signer
  );

  const encryptedRemark =
    remarks.trim() === "" ? "0x" : "0x" + encrypt(remarks, encryptionId);

  let params: string[] = [];

  // Prepare parameters based on action
  switch (action) {
    case "transferHolder":
      params = [newHolder, encryptedRemark];
      break;
    case "transferBeneficiary":
      params = [newBeneficiary, encryptedRemark];
      break;
    case "nominate":
      params = [newBeneficiary, encryptedRemark];
      break;
    case "transferOwners":
      params = [newHolder, newBeneficiary, encryptedRemark];
      break;
    default:
      params = [encryptedRemark];
      break;
  }

  // Simulate transaction first
  await contract.callStatic[action](...params);

  // Execute actual transaction
  const tx = await contract[action](...params);
  
  return tx;
}