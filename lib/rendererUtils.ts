/**
 * Renderer URL Extraction Utilities
 *
 * Extracts renderer URLs from different document formats:
 * - OpenAttestation v2: data.$template.url (UUID-encoded)
 * - OpenAttestation v3: openAttestationMetadata.template.url
 * - W3C VC: renderMethod[].id or renderMethod.url or renderMethod.template
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

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:/i;
  
  if (!uuidPattern.test(uuidString)) {
    return uuidString;
  }


  const parts = uuidString.split(":");

  if (parts.length < 3) {
    return uuidString;
  }

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
 * Extracts renderer URL from OpenAttestation v2 document's $template property
 */
function extractOpenAttestationV2Url(document: any): string | null {
  try {
    const templateUrl = document?.data?.$template?.url;

    if (!templateUrl) {
      return null;
    }

    const decodedUrl = decodeUuidValue(templateUrl);
    if (decodedUrl && isValidHttpUrl(decodedUrl)) {
      return decodedUrl;
    }

    return null;
  } catch (error) {
    console.error("Error extracting OpenAttestation v2 URL:", error);
    return null;
  }
}

/**
 * Extracts renderer URL from OpenAttestation v3 document's openAttestationMetadata property
 */
function extractOpenAttestationV3Url(document: any): string | null {
  try {
    const templateUrl = document?.openAttestationMetadata?.template?.url;

    if (templateUrl && isValidHttpUrl(templateUrl)) {
      return templateUrl;
    }

    return null;
  } catch (error) {
    console.error("Error extracting OpenAttestation v3 URL:", error);
    return null;
  }
}

/**
 * Extracts renderer URL from W3C Verifiable Credential's renderMethod property
 * 
 * Supports multiple formats:
 * 1. Array format (ChainDox/TrustVC style):
 *    renderMethod: [{ id: "https://...", type: "EMBEDDED_RENDERER", templateName: "INVOICE" }]
 * 
 * 2. Object format:
 *    renderMethod: { url: "https://...", template: "..." }
 * 
 * 3. String format:
 *    renderMethod: "https://..."
 */
function extractW3CVCUrl(document: any): string | null {
  try {
    // Check multiple possible locations for renderMethod
    const renderMethod =
      document?.renderMethod ||
      document?.credentialSubject?.renderMethod ||
      document?.signedW3CDocument?.renderMethod;

    if (!renderMethod) {
      return null;
    }

    if (Array.isArray(renderMethod)) {
      for (const method of renderMethod) {
        if (method?.id && isValidHttpUrl(method.id)) {
          if (process.env.NODE_ENV === "development") {
            console.log("Found W3C VC renderer URL in renderMethod[].id:", method.id);
          }
          return method.id;
        }
        if (method?.url && isValidHttpUrl(method.url)) {
          return method.url;
        }
        if (method?.template && isValidHttpUrl(method.template)) {
          return method.template;
        }
      }
      return null;
    }

    if (typeof renderMethod === "string" && isValidHttpUrl(renderMethod)) {
      return renderMethod;
    }

    if (typeof renderMethod === "object") {
      if (renderMethod.id && isValidHttpUrl(renderMethod.id)) {
        return renderMethod.id;
      }
      if (renderMethod.url && isValidHttpUrl(renderMethod.url)) {
        return renderMethod.url;
      }
      if (renderMethod.template && isValidHttpUrl(renderMethod.template)) {
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
 * Tries OpenAttestation v2, v3, and W3C VC formats
 * Returns null if no renderer URL found
 */
export function extractRendererUrl(document: any): string | null {
  if (!document) {
    return null;
  }


  if (document?.renderMethod || document?.credentialSubject?.renderMethod || document?.signedW3CDocument?.renderMethod) {
    const w3cUrl = extractW3CVCUrl(document);
    if (w3cUrl) {
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted W3C VC renderer URL:", w3cUrl);
      }
      return w3cUrl;
    }
  }

  if (document?.data?.$template) {
    const oaV2Url = extractOpenAttestationV2Url(document);
    if (oaV2Url) {
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted OpenAttestation v2 renderer URL:", oaV2Url);
      }
      return oaV2Url;
    }
  }

  if (document?.openAttestationMetadata?.template) {
    const oaV3Url = extractOpenAttestationV3Url(document);
    if (oaV3Url) {
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted OpenAttestation v3 renderer URL:", oaV3Url);
      }
      return oaV3Url;
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
  defaultUrl: string = "https://decentralizedrenderer.netlify.app/"
): string {
  const extractedUrl = extractRendererUrl(document);

  if (extractedUrl) {
    if (process.env.NODE_ENV === "development") {
      console.log("Using extracted renderer URL:", extractedUrl);
    }
    return extractedUrl;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("No renderer URL found in document, using default:", defaultUrl);
  }

  return defaultUrl;
}

// ============================================================================
// Document Data Extraction (for sending to renderer)
// ============================================================================

/**
 * Recursively unwraps UUID-encoded values in an OpenAttestation v2 document.
 */
function unwrapOpenAttestationV2Data(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle string values - decode UUID prefix
  if (typeof data === "string") {
    const decoded = decodeUuidValue(data);
    
    if (decoded !== null && decoded !== data) {
      // Check if original was marked as number
      if (data.includes(":number:")) {
        const num = parseFloat(decoded);
        return isNaN(num) ? decoded : num;
      }
      // Check if original was marked as boolean
      if (data.includes(":boolean:")) {
        return decoded === "true";
      }
      return decoded;
    }
    return data;
  }

  // Handle arrays - recursively unwrap each element
  if (Array.isArray(data)) {
    return data.map(item => unwrapOpenAttestationV2Data(item));
  }

  // Handle objects - recursively unwrap each property
  if (typeof data === "object") {
    const unwrapped: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      unwrapped[key] = unwrapOpenAttestationV2Data(data[key]);
    }
    return unwrapped;
  }

  return data;
}

/**
 * Checks if a document is OpenAttestation v2 format
 */
function isOpenAttestationV2(document: any): boolean {
  return (
    document?.version === "https://schema.openattestation.com/2.0/schema.json" ||
    (document?.data && document?.signature?.type === "SHA3MerkleProof")
  );
}

/**
 * Checks if a document is OpenAttestation v3 format
 */
function isOpenAttestationV3(document: any): boolean {
  return !!(document?.openAttestationMetadata);
}

/**
 * Checks if a document is W3C Verifiable Credential format
 */
function isW3CVerifiableCredential(document: any): boolean {
  const hasW3CContext = Array.isArray(document?.["@context"]) && 
    document["@context"].some((ctx: string) => 
      typeof ctx === "string" && ctx.includes("w3.org")
    );
  
  return !!(
    document?.credentialSubject ||
    document?.signedW3CDocument ||
    hasW3CContext ||
    document?.proof?.type === "DataIntegrityProof"
  );
}

/**
 * Extracts and unwraps the data from documents for rendering.
 * 
 * @param wrappedDocument - The full document (wrapped or signed)
 * @returns The unwrapped data suitable for rendering
 */
export function getOpenAttestationData(wrappedDocument: any): any {
  if (!wrappedDocument) {
    return null;
  }


  if (isW3CVerifiableCredential(wrappedDocument) && !isOpenAttestationV2(wrappedDocument)) {
    if (process.env.NODE_ENV === "development") {
      console.log("W3C VC format detected - returning document as-is");
    }
    return wrappedDocument;
  }

  // For OpenAttestation v3 - return as-is
  if (isOpenAttestationV3(wrappedDocument) && !isOpenAttestationV2(wrappedDocument)) {
    if (process.env.NODE_ENV === "development") {
      console.log("OpenAttestation v3 format detected - returning as-is");
    }
    return wrappedDocument;
  }

  // For OpenAttestation v2 - extract and UNWRAP the data field
  if (isOpenAttestationV2(wrappedDocument)) {
    if (process.env.NODE_ENV === "development") {
      console.log("OpenAttestation v2 format detected - unwrapping UUID-encoded values");
    }
    
    const wrappedData = wrappedDocument.data;
    if (!wrappedData) {
      console.warn("OpenAttestation v2 document has no data field");
      return wrappedDocument;
    }

    const unwrappedData = unwrapOpenAttestationV2Data(wrappedData);
    
    if (process.env.NODE_ENV === "development") {
      console.log("Unwrapped template name:", unwrappedData?.$template?.name);
    }

    return unwrappedData;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Document format not recognized, returning as-is");
  }
  return wrappedDocument;
}