import { ChatResponse, UploadResponse } from "@/types/chat";

const API_BASE_URL = "http://localhost:8000";

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload PDF");
    }

    const data = await response.json();
    console.log("Upload response:", data); // 디버깅용 로그

    // 응답 구조 확인 및 변환
    return {
      success: true,
      session_id: data.session_id || data.sessionId, // 백엔드 응답 필드명 대응
      message: data.message,
    };
  } catch (error) {
    console.error("Upload error details:", error);
    throw error;
  }
};

export const sendMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return {
      answer: data.answer,
      session_id: data.session_id || data.sessionId,
    };
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};
