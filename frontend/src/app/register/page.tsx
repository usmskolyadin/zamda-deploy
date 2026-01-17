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

  const isEmpty = (v: string) => !v.trim();

  const validateName = (name: string) => {
    if (isEmpty(name)) return "This field is required";
    if (name.length < 2) return "Must be at least 2 characters";
    if (name.length > 50) return "Too long name";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(name))
      return "Only letters, spaces, apostrophes and hyphens allowed";
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    if (email.length > 254) return "Email is too long";

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

    if (!emailRegex.test(email)) return "Invalid email address";
    return null;
  };


  const validatePassword = (password: string, email?: string) => {
    if (password.length < 8) return "Password at least 8 characters";
    if (password.length > 128) return "Password too long";
    if (/\s/.test(password)) return "Password must not contain spaces";
    if (!/[a-z]/.test(password)) return "Password must include a lowercase letter";
    if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
    if (!/\d/.test(password)) return "Password must include a number";
    if (!/[!@#$%^&*()_+=\-{}[\]|:;"'<>,.?/~`]/.test(password))
      return "Password must include a special character";

    if (email && password.toLowerCase().includes(email.split("@")[0]))
      return "Password must not contain your email";

    if (/^(.)\1+$/.test(password))
      return "Password is too weak";

    return null;
  };

  const validateCode = (code: string) => {
    if (!/^\d{6}$/.test(code))
      return "Verification code must be 6 digits";
    return null;
  };

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  const firstNameError = validateName(formData.first_name);
  if (firstNameError) return setError(firstNameError);

  const lastNameError = validateName(formData.last_name);
  if (lastNameError) return setError(lastNameError);

  const emailError = validateEmail(formData.email);
  if (emailError) return setError(emailError);

  const passwordError = validatePassword(
    formData.password,
    formData.email
  );
  if (passwordError) return setError(passwordError);

  if (formData.password !== formData.password2)
    return setError("Passwords do not match");

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

    const codeError = validateCode(code);
    if (codeError) return setError(codeError);

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
                  className="mt-4 hover:opacity-80 transition cursor-pointer bg-black w-full h-[44px] rounded-3xl flex justify-center items-center text-white"
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
