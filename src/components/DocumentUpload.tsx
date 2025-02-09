"use client";

import { useState } from "react";
import { Document, DocumentUploadRequest } from "@/types/chat";
import { uploadDocuments } from "@/lib/api";

export default function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !source.trim() || isUploading) return;

    setIsUploading(true);
    try {
      const document: Document = {
        text: text.trim(),
        metadata: {
          source: source.trim(),
        },
      };

      const request: DocumentUploadRequest = {
        documents: [document],
      };

      const response = await uploadDocuments(request);
      setMessage(
        response.success ? "Document uploaded successfully!" : "Upload failed"
      );
      if (response.success) {
        setText("");
        setSource("");
      }
    } catch (error) {
      setMessage("Failed to upload document");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Enter document text..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter source name..."
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
      {message && (
        <div
          className={`mt-4 p-2 rounded ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
