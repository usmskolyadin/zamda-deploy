"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose max-w-none mt-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}