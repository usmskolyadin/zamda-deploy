"use client"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-black ">404</h1>
      <img src="/not_found.png" alt="No ads available" className="w-86 h-86 object-contain" />
      <p className="mt-4 text-xl text-black ">Page not found</p>
      <a href="/" className="mt-6  text-black underline">
        Go to home
      </a>
    </div>
  );
}
