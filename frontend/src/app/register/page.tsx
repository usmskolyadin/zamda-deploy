'use client'

import { API_URL } from "@/src/shared/api/base";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Проверки
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  // 1 шаг — регистрация (отправка письма с кодом)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.");
      return;
    }
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else {
        setSuccess("Verification code sent to your email!");
        setStep("verify");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/register/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Invalid code");
      } else {
        setSuccess("Registration complete!");
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        setTimeout(() => router.push("/login"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> / <Link href="/">Register</Link>
          </p>
          <h1 className="mx-auto text-black font-bold text-4xl py-4 text-center">
            Sign up for Zamda
          </h1>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="flex-col items-center mx-auto mt-4 mb-4 w-full max-w-md">
            
            {step === "form" && (
              <form onSubmit={handleRegister}>
                <div className="flex">
                  <input
                    className="text-black p-4 border border-black rounded-3xl h-[44px] w-1/2 mr-2 mt-2"
                    placeholder="First name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="text-black p-4 border border-black rounded-3xl h-[44px] w-1/2 mt-2"
                    placeholder="Last name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <input
                  className="text-black p-4 border border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  className="text-black p-4 border border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input
                  className="text-black p-4 border border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Confirm password"
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />

                {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                {success && <p className="text-green-500 mt-2 text-center">{success}</p>}

                <button
                  type="submit"
                  className="mt-4 cursor-pointer bg-black w-full h-[44px] rounded-3xl flex justify-center items-center text-white"
                >
                  Register
                </button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <input
                  className="p-4 text-black border border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Enter verification code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />

                {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                {success && <p className="text-green-500 mt-2 text-center">{success}</p>}

                <button
                  type="submit"
                  className="mt-4 cursor-pointer bg-black w-full h-[44px] rounded-3xl flex justify-center items-center text-white"
                >
                  Verify & Finish
                </button>
              </form>
            )}

            <p className="text-black mt-4 text-center">
              Already have an account?{" "}
              <Link className="underline" href="/login">Log in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
