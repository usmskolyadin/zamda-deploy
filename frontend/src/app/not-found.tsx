"use client"

export default function Error() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-black ">Ooops.. 404</h1>
      <p className="mt-4 text-xl text-black ">This page not found right now {":("}</p>
      <img src="/not_found.png" alt="No ads available" className="w-76 h-76 object-contain" />
      <a href="/" className="mt-2  text-black underline">
        Go to home
      </a>
    </div>
  );
}
