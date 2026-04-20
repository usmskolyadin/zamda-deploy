"use client"

import { useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import Sidebar from "@/src/widgets/sidebar";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import UserSelector from "./UserSelector";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterPage() {
  const { user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState<"all" | "selected">("all");
  const [status, setStatus] = useState<string | null>(null);
  
  const handleSendToAll = async (subject: string, content: string) => {
    setIsSending(true);
    setStatus(null);

    try {
      const response = await apiFetchAuth("/api/newsletter/send-all/", {
        method: "POST",
        body: JSON.stringify({ subject, content }),
      });

      if (response.success) {
        setStatus("✅ Sent to all users");
      }
    } catch (error) {
      setStatus("❌ Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToSelected = async (subject: string, content: string) => {
    if (selectedUsers.length === 0) {
      setStatus("⚠️ Select users first");
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const response = await apiFetchAuth("/api/newsletter/send-selected/", {
        method: "POST",
        body: JSON.stringify({
          subject,
          content,
          user_ids: selectedUsers, 
        })
      });

      if (response.success) {
        setStatus(`✅ Sent to ${selectedUsers.length} users`);
        setSelectedUsers([]);
      }
    } catch (error) {
      setStatus("❌ Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">
          <Sidebar notHideOnPhone={true} />

          <div className="lg:w-3/4 lg:ml-24">
            <h1 className="text-black font-bold lg:text-4xl text-3xl py-4">Email Newsletter</h1>
            
            <div className="bg-white rounded-3xl  mb-8">
              <div className="flex gap-4 mb-6">
                <button
                  className={`cursor-pointer px-6 py-3 rounded-3xl font-bold transition-all ${
                    sendMode === "all" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setSendMode("all")}
                >
                  Send to All Users
                </button>
                <button
                  className={`cursor-pointer px-6 py-3 rounded-3xl font-bold transition-all ${
                    sendMode === "selected" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setSendMode("selected")}
                >
                  Send to Selected Users
                </button>
              </div>

              {sendMode === "selected" && (
                <div className="mb-6">
                  <UserSelector 
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                  />
                </div>
              )}
              {status && (
                <div className="mt-4 text-sm font-medium text-gray-700">
                  {status}
                </div>
              )}
              <NewsletterForm
                onSubmit={sendMode === "all" ? handleSendToAll : handleSendToSelected}
                isSending={isSending}
                mode={sendMode}
              />
            </div>

            <div className="bg-[#F2F1F0] rounded-3xl p-6">
              <h2 className="text-black font-bold text-xl mb-4">Markdown Tips</h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-medium mb-2">Formatting:</p>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-mono bg-white px-1 rounded"># Heading 1</span> - Main title</li>
                    <li><span className="font-mono bg-white px-1 rounded">## Heading 2</span> - Subtitle</li>
                    <li><span className="font-mono bg-white px-1 rounded">**bold**</span> - Bold text</li>
                    <li><span className="font-mono bg-white px-1 rounded">*italic*</span> - Italic text</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Lists & Links:</p>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-mono bg-white px-1 rounded">- item</span> - Bullet list</li>
                    <li><span className="font-mono bg-white px-1 rounded">1. item</span> - Numbered list</li>
                    <li><span className="font-mono bg-white px-1 rounded">[text](url)</span> - Hyperlink</li>
                    <li><span className="font-mono bg-white px-1 rounded">&gt; quote</span> - Blockquote</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}