import { apiFetch } from "@/src/shared/api/base"
import Markdown from "@/src/widgets/markdown"
import ReactMarkdown from "react-markdown"

async function getPage(slug: string) {
  return await apiFetch(`/api/pages/${slug}/`, {
    cache: "no-store",
  })
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getPage("items")
  return (
    <div className="min-h-screen bg-white text-black flex justify-center">
      <div className="max-w-screen-xl px-6 py-10">

        <h1 className="text-3xl font-semibold text-center">
          {page.title}
        </h1>

        {page.subtitle && (
          <h2 className="text-xl text-gray-600 text-center mt-2">
            {page.subtitle}
          </h2>
        )}

        <Markdown content={page.content} />
      </div>
    </div>
  )
}