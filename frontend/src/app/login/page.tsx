"use client"

import { useAuth } from "@/src/features/context/auth-context";
import { API_URL } from "@/src/shared/api/base";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

interface FormData {
  email: string;
  password: string;
}

const googleLogin = () => {
  const params = new URLSearchParams({
    client_id: `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`,
    redirect_uri: `${process.env.NEXT_PUBLIC_MAIN_URL}/auth/google/callback`,
    response_type: "code",
    scope: "email profile",
    prompt: "select_account",
  });

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    console.log("=== LOGIN START ===");
    console.log("API_URL:", API_URL);
    console.log("Final login URL:", `${API_URL}api/login/`);
    console.log("FormData:", formData);

    try {
      console.log("Sending LOGIN request...");

      const response = await fetch(`${API_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      }).catch(err => {
        console.error("FETCH FAILED BEFORE RESPONSE:", err);
        throw err;
      });

      console.log("Raw response:", response);
      console.log("Status:", response.status);
      console.log("Status text:", response.statusText);
      console.log("Headers:");
      response.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));

      let data;
      try {
        data = await response.json();
        console.log("Parsed JSON:", data);
      } catch (jsonErr) {
        console.error("JSON PARSE ERROR:", jsonErr);
        const text = await response.text();
        console.error("Raw text response:", text);
        setError("Server returned invalid JSON");
        return;
      }

      if (!response.ok) {
        console.log("Response not OK. Showing error...");
        console.log("Backend detail:", data?.detail);
        setError(data?.detail || "Invalid credentials");
        return;
      }

      console.log("Login successful. Access token:", data.access);

      // Second request: get user info
      const userUrl = `${API_URL}/api/users/me/`;
      console.log("Fetching user info from:", userUrl);

      const userRes = await fetch(userUrl, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      console.log("Raw userRes:", userRes);
      console.log("userRes status:", userRes.status);

      let userData;
      try {
        userData = await userRes.json();
        console.log("Parsed userData:", userData);
      } catch (err2) {
        console.error("USER JSON ERROR:", err2);
        const raw = await userRes.text();
        console.error("Raw userRes text:", raw);
        setError("Could not parse user info");
        return;
      }

      console.log("Calling login() with tokens and user data...");
      login(data.access, data.refresh, userData);

      console.log("Redirecting to /listings ...");
      router.push("/listings");

    } catch (err: any) {
      console.error("GLOBAL CATCH ERROR:", err);
      setError("Network error. Please try again later.");
    }

    console.log("=== LOGIN END ===");
  };
    
  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto w-">
          <p className="text-gray-500 pb-2"><Link href="/">Home</Link> / <Link href="/">Login</Link></p>
          <div className="lg:flex">
            <h1 className="mx-auto text-black font-bold text-4xl py-4 text-center">Sign in for Zamda</h1>
          </div>
        </div>
      </section>
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
            <div className="flex-col items-center mx-auto mt-4 mb-4 lg:mt-0 lg:mb-0">
              <button onClick={googleLogin} className="p-4 hover:opacity-80 transition cursor-pointer border-0.5 border text-gray-900 border-black rounded-3xl h-[44px] w-full flex items-center justify-center mt-2" id="" >
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                  <span className="ml-2">Continue with Google</span>
                </div>
              </button>
              <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-black" />
                <span className="mx-4 text-black">or</span>
                <hr className="flex-grow border-t border-black" />
              </div>
            <form onSubmit={handleSubmit}>
              <input
                className="p-4 border-0.5 border text-gray-900 border-black rounded-3xl h-[44px] w-full mt-2"
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className="p-4 border-0.5 border text-gray-900 border-black rounded-3xl h-[44px] w-full mt-2"
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <p className="text-black mt-2 text-left text-sm">
                Forgot your password? <Link className="underline" href="/restorepassword">Restore</Link>
              </p>

              {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
              {success && <p className="text-green-500 mt-2 text-center">{success}</p>}

              <p className="text-black mt-4 text-center">
                Don{"'"}t have an account? <Link className="underline" href="/register">Sign up</Link>
              </p>
              <button
                type="submit"
                className="cursor-pointer hover:opacity-80 transition mt-3 bg-black w-[120px] mx-auto h-[44px] rounded-3xl flex justify-center items-center text-white"
              >
                Login
              </button>
            </form>
            </div>
        </div>
      </section>
    </div>
  );
}
