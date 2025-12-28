"use client"

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { useAuth } from '@/src/features/context/auth-context';

export default function Footer() {
  const { user, logout } = useAuth();
    
  return (
        <footer className="lg:h-[236px] bg-[#333333] w-full p-6 lg:mb-0 mb-20">
          <div className="max-w-screen-xl lg:flex justify-between items-center w-full h-full mx-auto">
            <div className="min-w-48 flex justify-center lg:block">
                <Link href={"/"}>
                <div className="">
                  <div className="flex items-center">
                    <Image src={"/zamda-white.png"} width={1000} height={1000} className="w-10 h-10" alt={""} />
                    <h1 className="mr-12 font-bold text-4xl text-white">Zamda</h1>
                  </div>
                  <p className="text-gray-300 ml-2 text-sm">© Copyright ZAMDA 2025</p>
                </div>
                </Link>
              </div>
              <div className="mt-2 lg:mt-0">
                <Link className="lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/about">About Zamda</Link>
                <Link className="lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/help">Help</Link>
                <Link className="lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/policy">Privacy Policy </Link>
                <Link className="lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/terms"> Terms of Use</Link>
              </div>
              {user ? (
                <></>
              ) : (
              <div className="flex lg:mt-0 mt-4">
                <button className="mr-2 text-white border border-white p-2 text-white flex justify-center items-center h-[36px] lg:w-[152px] w-full rounded-3xl">
                  <Link href={"/login"}>Sign in</Link>
                </button>
                <button className="border text-white border-white p-2 text-white flex justify-center items-center h-[36px] lg:w-[152px] w-full rounded-3xl">
                  <Link href={"/register"}>Sign up</Link>
                </button>
              </div>
              )}

          </div>
        </footer>
  )
}