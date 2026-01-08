"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  FrameConnector,
  HostActionsHandler,
  FrameActions,
  renderDocument,
} from "@tradetrust-tt/decentralized-renderer-react-components";
import { getRendererUrl, getOpenAttestationData } from "@/lib/rendererUtils";

interface DocumentRendererProps {
  rendererUrl?: string;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  rendererUrl = "http://localhost:3003/",
}): React.ReactElement => {
  const toFrame = useRef<HostActionsHandler | undefined>(undefined);
  const [height, setHeight] = useState(800);
  const [rawDocument, setRawDocument] = useState<any>(null); // Wrapped document
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [rendererTimeout, setRendererTimeout] = useState(false);
  const [dynamicRendererUrl, setDynamicRendererUrl] = useState<string>(
    rendererUrl || "http://localhost:3003/"
  );

  // Use useMemo for stable document reference
  const document = useMemo(() => {
    if (!rawDocument) return null;
    
    const unwrapped = getOpenAttestationData(rawDocument);
    
    if (process.env.NODE_ENV === "development" && unwrapped) {
      const templateName = unwrapped?.$template?.name;
      if (templateName && templateName.includes(":string:")) {
        console.error("❌ ERROR: Template name still has UUID encoding!");
        console.error("   This will cause the renderer to fail.");
      }
    }
    
    return unwrapped;
  }, [rawDocument]);

  // Load document from localStorage
  useEffect(() => {
    try {
      const savedDoc = localStorage.getItem("verifiedDocument");

      if (savedDoc) {
        const parsedDoc = JSON.parse(savedDoc);

        // Store the wrapped document (full document with signature)
        setRawDocument(parsedDoc);

        // Extract and set dynamic renderer URL
        const extractedUrl = getRendererUrl(parsedDoc, rendererUrl);
        setDynamicRendererUrl(extractedUrl);

        // Reset timeout state when loading new document
        setRendererTimeout(false);

        // Log template information for debugging (still wrapped at this point)
        const templateName = parsedDoc?.data?.$template?.name;
        const templateType = parsedDoc?.data?.$template?.type;
        if (!templateName && !templateType) {
          console.warn("No template information found in document");
        }
      } else {
        setError("No document found in localStorage");
      }
    } catch (err) {
      console.error("Error loading document:", err);
      setError("Failed to load document from localStorage");
    }
  }, [rendererUrl]);

  // Handle connection to renderer
  const handleConnected = useCallback((toFrameHandler: HostActionsHandler) => {
    
    toFrame.current = toFrameHandler;
    setIsConnected(true);

    // CRITICAL: Send UNWRAPPED document immediately upon connection
    if (document && rawDocument && toFrame.current) {
      // Verify the template name is unwrapped before sending
      const templateName = document?.$template?.name;
      if (templateName) {
        if (templateName.includes(":string:") || templateName.includes(":number:")) {
          console.error("⚠️ WARNING: Template name appears to still be UUID-encoded!");
        }
      }
      
      // Send the properly unwrapped document to the renderer
      toFrame.current(renderDocument({ document, rawDocument }));
    }
  }, [document, rawDocument]);

  // Handle messages from renderer
  const handleDispatch = useCallback((action: FrameActions): void => {
    

    if (action.type === "UPDATE_HEIGHT") {
      setHeight(action.payload);
    }

    if (action.type === "UPDATE_TEMPLATES") {
      
      
      // Log the template names for debugging
      if (Array.isArray(action.payload)) {
        action.payload.forEach((template: any) => {
          // intentionally no-op: template data available if needed for debugging
          void template;
        });
      }
    }

    if (action.type === "TIMEOUT") {
      console.error("Renderer connection timeout:", dynamicRendererUrl);
      setRendererTimeout(true);
      setIsConnected(false);
    }
  }, [dynamicRendererUrl]);

  // Re-render document when it changes (after initial connection)
  useEffect(() => {
    if (toFrame.current && document && isConnected) {
      toFrame.current(renderDocument({ document, rawDocument }));
    }
  }, [document, rawDocument, isConnected]);

  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Document
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="w-full p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="text-gray-600">Loading document...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Info panel - shown when not in timeout state */}
      {!rendererTimeout && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Renderer URL:</span> {dynamicRendererUrl}
          </p>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Template:</span> {document?.$template?.name || "Unknown"}
          </p>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Status:</span>{" "}
            {isConnected ? "✓ Connected" : "⟳ Connecting..."}
          </p>
        </div>
      )}

      {/* Timeout Error UI */}
      {rendererTimeout && (
        <div className="mb-4 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            Renderer Connection Timeout
          </h3>
          <p className="text-red-700 mb-4">
            Failed to connect to the document renderer within 5 seconds.
            This may be due to network issues, CORS restrictions, or the renderer being unavailable.
          </p>
          <div className="bg-white p-3 rounded border border-red-200 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Renderer URL:</span>
              <span className="ml-2 font-mono text-xs break-all">{dynamicRendererUrl}</span>
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Renderer iframe - only shown when not in timeout state */}
      {!rendererTimeout && (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <FrameConnector
            source={dynamicRendererUrl}
            dispatch={handleDispatch}
            onConnected={handleConnected}
            className="w-full"
            style={{ height: `${height}px`, minHeight: "400px" }}
          />
        </div>
      )}
    </div>
  );
};