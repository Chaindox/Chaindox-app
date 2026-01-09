import { DocumentId, CreateDocumentRequest, CreateDocumentResult, CreateDocumentResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      'Authorization': process.env.NEXT_PUBLIC_API_KEY || ''
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
        'Authorization': process.env.NEXT_PUBLIC_API_KEY || ''
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        // Extract user-friendly error message
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details) {
            errorMessage = errorData.error.details;
          }
        }
      } catch (e) {
        // If JSON parsing fails, try text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
      return {
        success: false,
        error: errorMessage,
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