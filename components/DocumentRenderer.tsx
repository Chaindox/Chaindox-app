"use client"

import React, { useState, useEffect, useCallback } from "react";
import {
  FrameConnector,
  HostActionsHandler,
  FrameActions,
} from "@tradetrust-tt/decentralized-renderer-react-components";
import { getRendererUrl } from "@/lib/rendererUtils";

interface DocumentRendererProps {
  rendererUrl?: string;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  rendererUrl = "http://localhost:5173/",
}): React.ReactElement => {
  const [toFrame, setToFrame] = useState<HostActionsHandler | undefined>();
  const [height, setHeight] = useState(800);
  const [document, setDocument] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [dynamicRendererUrl, setDynamicRendererUrl] = useState<string>(
    rendererUrl || "http://localhost:5173/"
  );

  // Load document from localStorage
  useEffect(() => {
    try {
      const savedDoc = localStorage.getItem("verifiedDocument");

      if (savedDoc) {
        const parsedDoc = JSON.parse(savedDoc);
        setDocument(parsedDoc);

        // Extract and set dynamic renderer URL
        const extractedUrl = getRendererUrl(parsedDoc, rendererUrl);
        setDynamicRendererUrl(extractedUrl);

        console.log("Document loaded from localStorage:", parsedDoc);
        console.log("Renderer URL:", extractedUrl);
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
    console.log("Connected to renderer!");
    setToFrame(() => toFrameHandler);
    setIsConnected(true);
  }, []);

  // Handle messages from renderer
  const handleDispatch = useCallback((action: FrameActions): void => {
    console.log("Received action from renderer:", action);

    if (action.type === "UPDATE_HEIGHT") {
      setHeight(action.payload);
    }

    if (action.type === "UPDATE_TEMPLATES") {
      console.log("Available templates:", action.payload);
    }
  }, []);

  // Send document to renderer when both are ready
  useEffect(() => {
    if (toFrame && document && isConnected) {
      console.log("Sending document to renderer...");
      toFrame({
        type: "RENDER_DOCUMENT",
        payload: {
          document,
        },
      });
    }
  }, [toFrame, document, isConnected]);

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
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Renderer URL:</span> {dynamicRendererUrl}
        </p>
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Status:</span>{" "}
          {isConnected ? "✓ Connected" : "⟳ Connecting..."}
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        <FrameConnector
          source={dynamicRendererUrl}
          dispatch={handleDispatch}
          onConnected={handleConnected}
          className="w-full"
          style={{ height: `${height}px`, minHeight: "400px" }}
        />
      </div>
    </div>
  );
};