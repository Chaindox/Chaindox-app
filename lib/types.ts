import { Signer } from "ethers";
import { SignedVerifiableCredential, RawVerifiableCredential, WrappedDocument, OpenAttestationDocument } from "@trustvc/trustvc";


export interface WarningPopupState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "info" | "error" | "success" | "warning";
}

export interface ContractState {
  titleEscrowAddress: string;
  holder: string;
  beneficiary: string;
  prevHolder: string;
  prevBeneficiary: string;
  nominee: string;
  encryptionId: string;
  endorsementChain: EndorsementChainItem[];
}

export interface EndorsementChainItem {
  type: EndorsementActionType;
  timestamp: number;
  owner: string;
  holder: string;
  remark: string;
}

export type EndorsementActionType =
  | "INITIAL"
  | "NOMINATE"
  | "REJECT_TRANSFER_BENEFICIARY"
  | "REJECT_TRANSFER_HOLDER"
  | "REJECT_TRANSFER_OWNERS"
  | "RETURN_TO_ISSUER_ACCEPTED"
  | "RETURN_TO_ISSUER_REJECTED"
  | "RETURNED_TO_ISSUER"
  | "SURRENDER_ACCEPTED"
  | "SURRENDER_REJECTED"
  | "SURRENDERED"
  | "TRANSFER_BENEFICIARY"
  | "TRANSFER_HOLDER"
  | "TRANSFER_OWNERS";

export interface ActionButton {
  btnName: string;
  action: string;
  show: boolean;
}

export interface WalletState {
  account: string;
  signer: Signer | null;
  isConnected: boolean;
}

export interface ContractError {
  title: string;
  message: string;
}

export type VerifiedDocument =
  | SignedVerifiableCredential
  | RawVerifiableCredential
  | WrappedDocument<OpenAttestationDocument>
  | OpenAttestationDocument
  | { signedW3CDocument: SignedVerifiableCredential };

export interface OpenAttestationTemplate {
  name: string;
  type: string;
  url: string;
}

export interface W3CRenderMethod {
  type?: string;
  template?: string;
  url?: string;
  [key: string]: any;
}

export interface VerificationResult {
  DOCUMENT_INTEGRITY: boolean;
  DOCUMENT_STATUS: boolean;
  ISSUER_IDENTITY: boolean;
}

export interface CreateDocumentRequest {
  credentialSubject: CredentialSubject;
  owner: string;
  holder: string;
  remarks: string;
}

export interface CreateDocumentResponse {
  signedW3CDocument: any;
}

export type DocumentId = 'ELECTRONIC_PROMISSORY_NOTE' | 'WAREHOUSE_RECEIPT' | 'BILL_OF_LADING' | 'INVOICE' | 'CERTIFICATE_OF_ORIGIN' | 'SAMPLE';

export interface CreateDocumentResult {
  success: boolean;
  data?: CreateDocumentResponse;
  error?: string;
}

// =============================================================================
// Document Contexts
// =============================================================================

export type CredentialSubject = ElectronicPromissoryNote | WarehouseReceipt | BillOfLading | Invoice | Record<string, any>;

export interface ElectronicPromissoryNote {
  epnId?: string;
  promissoryNoteNumber?: string;
  documentIdentifier?: string;

  issueDate?: string;
  issuePlace?: string;
  maturityDate?: string;
  paymentDueDate?: string;

  maker?: {
    makerName?: string;
    makerAddress?: string;
    makerId?: string;
    makerTaxId?: string;
    makerContact?: string;
  };

  payee?: {
    payeeName?: string;
    payeeAddress?: string;
    payeeId?: string;
    payeeBankAccount?: string;
  };

  beneficiary?: {
    beneficiaryName?: string;
    beneficiaryAddress?: string;
    beneficiaryAccount?: string;
  };

  endorser?: {
    endorserName?: string;
    endorserSignature?: string;
    endorsementDate?: string;
  };

  principalAmount?: number;
  currency?: string;
  amountInWords?: string;
  interestRate?: number;
  interestCalculationMethod?: string;
  totalAmountPayable?: number;

  paymentTerms?: string;
  paymentMethod?: string;
  paymentPlace?: string;
  paymentInstructions?: string;

  bankDetails?: {
    bankName?: string;
    bankAddress?: string;
    bankSwiftCode?: string;
    bankAccountNumber?: string;
    bankRoutingNumber?: string;
  };

  underlyingContract?: {
    contractReference?: string;
    invoiceReference?: string;
    purchaseOrderReference?: string;
  };

  isNegotiable?: boolean;
  isTransferable?: boolean;
  transferRestrictions?: string;

  governingLaw?: string;
  disputeResolution?: string;
  termsAndConditions?: string;

  digitalSignature?: {
    signatureTimestamp?: string;
    signatureMethod?: string;
    certificateAuthority?: string;
  };

  noteStatus?: string;
  paymentStatus?: string;
  defaultClause?: string;
  acceleration?: string;

  witnessName?: string;
  witnessSignature?: string;
  witnessAddress?: string;

  notaryPublic?: {
    notaryName?: string;
    notarySeal?: string;
    notarizationDate?: string;
  };

  collateral?: {
    collateralDescription?: string;
    collateralValue?: number;
  };

  amendmentHistory?: Array<{
    amendmentDate?: string;
    amendmentDetails?: string;
  }>;
}

export interface WarehouseReceipt {
  wrId?: string;
  receiptNumber?: string;
  documentIdentifier?: string;

  issueDate?: string;
  receiptDate?: string;
  expiryDate?: string;
  storageStartDate?: string;
  storageEndDate?: string;

  warehouseKeeper?: {
    warehouseKeeperName?: string;
    warehouseKeeperAddress?: string;
    warehouseKeeperLicense?: string;
    warehouseKeeperContact?: string;
  };

  depositor?: {
    depositorName?: string;
    depositorAddress?: string;
    depositorId?: string;
    depositorContact?: string;
  };

  holder?: {
    holderName?: string;
    holderAddress?: string;
    holderId?: string;
  };

  notifyParty?: {
    notifyPartyName?: string;
    notifyPartyContact?: string;
  };

  warehouseLocation?: {
    warehouseName?: string;
    warehouseAddress?: string;
    warehouseCode?: string;
    warehouseCountry?: string;
    warehouseZone?: string;
    storageBin?: string;
  };

  goodsDescription?: string;
  commodityCode?: string;
  hsCode?: string;
  productIdentifier?: string;
  batchNumber?: string;
  serialNumbers?: string[];

  quantity?: number;
  quantityUnit?: string;
  numberOfPackages?: number;
  packagingType?: string;
  packagingMarks?: string;

  grossWeight?: number;
  netWeight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  dimensions?: string;

  storageConditions?: {
    temperatureRange?: string;
    humidityRange?: string;
    specialHandlingInstructions?: string;
    hazardClass?: string;
  };

  storageCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalCharges?: number;
  paymentTerms?: string;
  paymentStatus?: string;

  // bagian ini belum masuk form
  insuranceValue?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  inboundReference?: string;
  inboundDate?: string;
  transportMode?: string;
  vehicleNumber?: string;

  receiptStatus?: string;
  isNegotiable?: boolean;
  isTransferable?: boolean;

  termsAndConditions?: string;
  liabilityClause?: string;
  signature?: string;
  signatureDate?: string;
  authorizedSignatory?: string;
}

export interface BillOfLading {
  bolId?: string;
  documentIdentifier?: string;
  bookingReference?: string;
  houseWaybillId?: string;
  transportContractNumber?: string;
  contractNumber?: string;
  freightForwarderReference?: string;

  issueDate?: string;
  actualArrivalDate?: string;
  estimatedDeparture?: string;
  actualDepartureDate?: string;
  loadingDate?: string;
  estimatedArrival?: string;

  buyer?: {
    buyerName?: string;
    buyerAddress?: string;
  };

  importer?: {
    importerName?: string;
    importerAddress?: string;
    importerTaxId?: string;
  };

  exporter?: {
    exporterName?: string;
    exporterAddress?: string;
    exporterTaxId?: string;
  };

  carrier?: {
    carrierName?: string;
    carrierLicenseNumber?: string;
  };

  consignee?: {
    consigneeName?: string;
    consigneeAddress?: string;
  };

  freightForwarder?: {
    freightForwarderName?: string;
    freightForwarderLicense?: string;
  };

  notifyParty?: {
    notifyPartyName?: string;
    notifyPartyContact?: string;
  };

  pickupParty?: {
    pickupPartyName?: string;
    pickupPartyAddress?: string;
  };

  consignor?: {
    consignorName?: string;
    consignorAddress?: string;
  };

  freightPayer?: {
    freightPayerName?: string;
    freightPayerAddress?: string;
  };

  deliveryLocation?: {
    deliveryAddress?: string;
    deliveryCountryCode?: string;
  };

  paymentLocation?: string;

  despatchLocation?: {
    despatchAddress?: string;
    despatchCountryCode?: string;
  };

  exportationCountry?: string;
  originCountry?: string;

  unloadingLocation?: {
    unloadingPortCode?: string;
    unloadingCountry?: string;
  };

  transportConditions?: string;
  tradeTermsDescription?: string;
  tradeTermsCode?: string;

  goodsDescription?: string;
  numberOfPackages?: number;
  packagingType?: string;
  shippingMarks?: string;

  grossWeight?: number;
  netWeight?: number;
  volume?: number;

  journeyIdentifier?: string;
  containerSizeType?: string;
  containerStatus?: string;
  transportMeansId?: string;
  vehicleRegistration?: string;
  equipmentIdentifier?: string;

  sealIdentifier?: string;

  freightCharges?: number;
  prepaidAmount?: number;
  collectCharges?: number;
}

/*
export interface BillableItem {
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}
*/

export interface Invoice {
  invoiceId?: string;
  invoiceName?: string;
  date?: string;
  customerId?: string;
  terms?: string;

  billFrom?: {
    billFromName?: string;
    billFromStreetAddress?: string;
    billFromCity?: string;
    billFromPostalCode?: string;
    billFromPhoneNumber?: string;
  };

  billTo?: {
    billToName?: string;
    billToEmail?: string;
  };

  billToCompany?: {
    billToCompanyName?: string;
    billToCompanyStreetAddress?: string;
    billToCompanyCity?: string;
    billToCompanyPostalCode?: string;
    billToCompanyPhoneNumber?: string;
  };

  billableItems?: {
    billableItemsDescription?: string;
    billableItemsQuantity?: number;
    billableItemsRate?: number;
    billableItemsAmount?: number;
  };
  subtotal?: number;
  tax?: number;
  taxTotal?: number;
  total?: number;
}

export interface CertificateOfOrigin {
  cooId?: string;
  issueDateTime?: string;
  firstSignatoryAuthentication?: string;
  signature?: string;

  // Supply Chain Consignment
  supplyChainConsignment?: string;
  supplyChainConsignmentId?: string;
  supplyChainConsignmentInformation?: string;

  // Export Country
  exportCountry?: string;
  exportCountryCode?: string;

  // Exporter Information (flattened)
  exporter?: string;
  exporterId?: string;
  exporterName?: string;
  exporterLine1?: string;
  exporterLine2?: string;
  exporterCityName?: string;
  exporterPostcode?: string;
  exporterCountrySubDivisionName?: string;
  exporterCountryCode?: string;

  // Import Country
  importCountry?: string;
  importCountryCode?: string;

  // Importer Information (flattened)
  importer?: string;
  importerId?: string;
  importerName?: string;
  importerLine1?: string;
  importerLine2?: string;
  importerCityName?: string;
  importerPostcode?: string;
  importerCountrySubDivisionName?: string;
  importerCountryCode?: string;

  // Consignment Items
  includedConsignmentItems?: string;

  // Loading Location
  loadingBaseportLocation?: string;
  loadingBaseportLocationId?: string;
  loadingBaseportLocationName?: string;

  // Transport Movement
  mainCarriageTransportMovement?: string;
  mainCarriageTransportMovementId?: string;
  mainCarriageTransportMovementInformation?: string;
  usedTransportMeansName?: string;
  usedTransportMeansId?: string;
  departureDateTime?: string;

  // Unloading Location
  unloadingBaseportLocation?: string;
  unloadingBaseportLocationId?: string;
  unloadingBaseportLocationName?: string;
}