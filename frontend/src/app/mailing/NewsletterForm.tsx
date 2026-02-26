"use client"

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface NewsletterFormProps {
  onSubmit: (subject: string, content: string) => Promise<void>;
  isSending: boolean;
  mode: "all" | "selected";
}

export default function NewsletterForm({ onSubmit, isSending, mode }: NewsletterFormProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState<"write" | "preview">("write");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(subject, content);
    if (mode === "all") {
      setSubject("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-black font-medium mb-2">
          Subject Line
        </label>
        <input
          className="p-4 border-0.5 border text-gray-900 border-black rounded-3xl h-[44px] w-full"
          placeholder="Enter email subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-black font-medium">
            Email Content (Markdown supported)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-1 rounded-3xl text-sm font-medium transition-all ${
                previewMode === "write" 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setPreviewMode("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={`px-4 py-1 rounded-3xl text-sm font-medium transition-all ${
                previewMode === "preview" 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setPreviewMode("preview")}
            >
              Preview
            </button>
          </div>
        </div>

        {previewMode === "write" ? (
          <textarea
            className="p-4 border-0.5 border text-gray-900 border-black rounded-3xl w-full min-h-[300px] font-mono"
            placeholder="Write your email content in Markdown...

# Welcome to our newsletter

## Highlights
- Feature 1
- Feature 2

Check out our [website](https://example.com)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        ) : (
          <div className="p-4 border-0.5 border border-black rounded-3xl w-full min-h-[300px] bg-gray-50 prose prose-sm max-w-none">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSending}
          className="cursor-pointer bg-black text-white px-8 py-3 rounded-3xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSending 
            ? "Sending..." 
            : mode === "all" 
              ? "Send to All Users" 
              : `Send to Selected (${mode === "selected" ? "0" : ""})`
          }
        </button>
      </div>
    </form>
  );
}