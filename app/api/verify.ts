import { DocumentId, CreateDocumentRequest, CreateDocumentResult, CreateDocumentResponse } from "@/lib/types";

const API_BASE_URL = 'http://localhost:5000';

export interface VerificationResult {
  VALIDITY: boolean;
  DOCUMENT_INTEGRITY: boolean;
  DOCUMENT_STATUS: boolean;
  ISSUER_IDENTITY: boolean;
}

export async function verifyDocument(vc: any): Promise<VerificationResult> {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vc),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Creates a document by calling the /create/:documentId endpoint
 * @param documentId - The document type to create
 * @param payload - The document creation payload
 * @returns Promise with success status, data, or error
 */
export async function createDocument(
  documentId: DocumentId,
  payload: CreateDocumentRequest
): Promise<CreateDocumentResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/create/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP error! status: ${response.status}, message: ${errorText}`,
      };
    }

    const data: CreateDocumentResponse = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}