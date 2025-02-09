export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  session_id?: string;
  sources?: string[];
}

export interface UploadResponse {
  success: boolean;
  session_id: string;
  message?: string;
}

export interface Document {
  text: string;
  metadata: {
    source: string;
  };
}

export interface DocumentUploadRequest {
  documents: Document[];
}

export interface DocumentUploadResponse {
  success: boolean;
  message?: string;
}
