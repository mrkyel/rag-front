"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { sendMessage, uploadPDF } from "@/lib/api";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [mode, setMode] = useState<"LLM" | "RAG">("LLM");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);
    try {
      const response = await uploadPDF(file);
      if (response.success && response.session_id) {
        setSessionId(response.session_id);
        setMode("RAG");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `PDF uploaded successfully! You can now ask questions about "${file.name}". Session ID: ${response.session_id}`,
          },
        ]);
        console.log(
          "PDF upload successful, using session_id:",
          response.session_id
        );
      } else {
        throw new Error("Failed to get session_id from upload response");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to upload PDF. Please try again.",
        },
      ]);
      setSessionId(undefined);
      setMode("LLM");
    } finally {
      setIsLoading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    console.log("Sending message with session_id:", sessionId);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await sendMessage(userMessage, sessionId);

      if (!sessionId && mode === "LLM" && response.session_id) {
        setSessionId(response.session_id);
        console.log("New LLM session created:", response.session_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your message.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">
            {mode === "RAG" ? "RAG Chat" : "AI Chat"}
          </h1>
          <span className="text-sm px-2 py-1 rounded bg-gray-100">
            {mode === "RAG" ? "PDF Context Enabled" : "General Chat"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="w-full">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf"
              disabled={isLoading}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 text-gray-500 text-sm
              focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-white shadow-sm"
            }`}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Type your message... ${
            mode === "RAG" ? "(PDF Context)" : ""
          }`}
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
