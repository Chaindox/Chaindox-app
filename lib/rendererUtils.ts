/**
 * Renderer URL Extraction Utilities
 *
 * Extracts renderer URLs from different document formats:
 * - OpenAttestation: data.$template.url (UUID-encoded)
 * - W3C VC: renderMethod.url or renderMethod.template
 */

/**
 * Extracts the actual value from a UUID-encoded string
 * OpenAttestation format: "uuid:type:value"
 * Example: "b21ca1a1-d02c-44b8-895e-009df10bcf0a:string:https://tutorial-renderer.openattestation.com"
 * Returns: "https://tutorial-renderer.openattestation.com"
 */
function decodeUuidValue(uuidString: string | undefined): string | null {
  if (!uuidString || typeof uuidString !== "string") {
    return null;
  }

  // UUID-encoded format: "uuid:type:value"
  // We need to extract everything after the second colon
  const parts = uuidString.split(":");

  // Must have at least 3 parts: uuid, type, value
  if (parts.length < 3) {
    return null;
  }

  // Join everything after the second colon (in case the value contains colons)
  const value = parts.slice(2).join(":");

  return value || null;
}

/**
 * Validates that a string is a valid HTTP/HTTPS URL
 */
function isValidHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts renderer URL from OpenAttestation document's $template property
 */
function extractOpenAttestationUrl(document: any): string | null {
  try {
    // Navigate to data.$template.url
    const templateUrl = document?.data?.$template?.url;

    if (!templateUrl) {
      return null;
    }

    // Decode UUID-encoded value
    const decodedUrl = decodeUuidValue(templateUrl);

    // Validate the extracted URL
    if (decodedUrl && isValidHttpUrl(decodedUrl)) {
      return decodedUrl;
    }

    return null;
  } catch (error) {
    console.error("Error extracting OpenAttestation URL:", error);
    return null;
  }
}

/**
 * Extracts renderer URL from W3C Verifiable Credential's renderMethod property
 */
function extractW3CVCUrl(document: any): string | null {
  try {
    // Check multiple possible locations for renderMethod
    const renderMethod =
      document?.renderMethod ||
      document?.signedW3CDocument?.renderMethod;

    if (!renderMethod) {
      return null;
    }

    // If renderMethod is a string, it might be the URL directly
    if (typeof renderMethod === "string" && isValidHttpUrl(renderMethod)) {
      return renderMethod;
    }

    // Check for url property
    if (renderMethod.url && isValidHttpUrl(renderMethod.url)) {
      return renderMethod.url;
    }

    // Check for template property (might contain URL)
    if (renderMethod.template) {
      if (isValidHttpUrl(renderMethod.template)) {
        return renderMethod.template;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting W3C VC URL:", error);
    return null;
  }
}

/**
 * Extracts renderer URL from any supported document format
 * Tries both OpenAttestation and W3C VC formats
 * Returns null if no renderer URL found
 */
export function extractRendererUrl(document: any): string | null {
  if (!document) {
    return null;
  }

  // Try OpenAttestation format first (check for $template)
  if (document?.data?.$template) {
    const oaUrl = extractOpenAttestationUrl(document);
    if (oaUrl) {
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted OpenAttestation renderer URL:", oaUrl);
      }
      return oaUrl;
    }
  }

  // Try W3C VC format (check for renderMethod)
  if (document?.renderMethod || document?.signedW3CDocument?.renderMethod) {
    const w3cUrl = extractW3CVCUrl(document);
    if (w3cUrl) {
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted W3C VC renderer URL:", w3cUrl);
      }
      return w3cUrl;
    }
  }

  return null;
}

/**
 * Gets renderer URL from document with fallback to default
 * This is the main function to use in components
 */
export function getRendererUrl(
  document: any,
  defaultUrl: string = "http://localhost:5173/"
): string {
  const extractedUrl = extractRendererUrl(document);

  if (extractedUrl) {
    return extractedUrl;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("No renderer URL found in document, using default:", defaultUrl);
  }

  return defaultUrl;
}

/**
 * Extracts the unwrapped data from OpenAttestation documents
 * This is needed because renderers expect the unwrapped data, not the full wrapped document
 *
 * OpenAttestation v2 structure:
 * {
 *   "version": "https://schema.openattestation.com/2.0/schema.json",
 *   "data": { ... },  // <- This is what the renderer needs
 *   "signature": { ... }
 * }
 */
export function getOpenAttestationData(wrappedDocument: any): any {
  if (!wrappedDocument) {
    return null;
  }

  // For W3C VC format - already unwrapped (no data wrapper)
  if (wrappedDocument?.credentialSubject || wrappedDocument?.signedW3CDocument) {
    return wrappedDocument;
  }

  // For OpenAttestation v2 - extract data field
  // This is the most common case and the one causing the issue
  if (wrappedDocument?.data && wrappedDocument?.signature) {
    if (process.env.NODE_ENV === "development") {
      console.log("Unwrapping OpenAttestation v2 document data");
    }
    return wrappedDocument.data;
  }

  // For OpenAttestation v3 - return as-is (already unwrapped format)
  if (wrappedDocument?.openAttestationMetadata) {
    return wrappedDocument;
  }

  // Fallback - return document as-is
  if (process.env.NODE_ENV === "development") {
    console.log("Document format not recognized, returning as-is");
  }
  return wrappedDocument;
}
