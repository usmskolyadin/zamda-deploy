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
                <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/about">About Zamda</Link>
                <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/help">Help</Link>
                <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/policy">Privacy Policy </Link>
                <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-5 text-white" href="/terms"> Terms of Use</Link>
              </div>
              {user ? (
                <>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/zamdamazing?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr">
                    <svg className='invert hover:opacity-70 transition' width={28} height={28} enableBackground="new 0 0 512 512" id="Layer_1" version="1.1" viewBox="0 0 512 512"  xmlns="http://www.w3.org/2000/svg"><g><path d="M505,257c0,34.8-0.7,69.7,0.2,104.5c1.5,61.6-37.2,109.2-86.5,130.4c-19.8,8.5-40.6,13-62.1,13c-67.3,0.1-134.7,1-202-0.3   c-50.7-1-92.4-22.2-122.3-64c-15.7-22-23.2-47-23.2-74.1c0-71.7,0-143.3,0-215c0-58.5,28.5-99.4,79.1-126C110.2,14,134.1,9.1,159,9   c65.3,0,130.7-0.4,196,0.2c50.7,0.4,93,19.8,124.2,60.6c17.4,22.8,25.8,49,25.8,77.8C505,184,505,220.5,505,257z M46,257   c0,36.7,0,73.3,0,110c0,16.4,3.8,31.8,12.3,45.7c22.3,36.5,56,54.3,97.8,55c67.1,1,134.3,0.4,201.5,0.2c16.5,0,32.5-3.4,47.4-10.5   c40.6-19.4,63.3-50.3,63.1-96.7c-0.4-71-0.1-142-0.1-213c0-20.1-5.7-38.5-17.6-54.7c-23-31.1-54.8-46.4-92.8-46.8   c-67-0.8-134-0.3-201-0.2c-14.3,0-28.1,2.9-41.5,7.9c-36.8,13.7-71,48.4-69.4,99.5C46.9,188,46,222.5,46,257z"/><path d="M257.6,363c-64.5,0-116.5-51.4-116.6-115.4c-0.1-63,52.3-114.6,116.4-114.6c64.3-0.1,116.5,51.4,116.6,114.9   C374,311.3,321.9,362.9,257.6,363z M257.6,326c43.9,0,79.5-35.1,79.4-78.3c-0.1-42.8-35.7-77.8-79.4-77.8   c-43.9,0-79.7,34.9-79.7,78C178,291.1,213.7,326.1,257.6,326z"/><path d="M387.5,98c13.5,0,24.5,11.5,24.5,25.6c-0.1,14.1-11.2,25.5-24.7,25.4c-13.3-0.1-24.2-11.5-24.2-25.3   C363,109.6,374,98,387.5,98z"/></g></svg>
                  </a>
                  
                  <a href="https://www.facebook.com/ZAMDAmazing/">
                    <svg className='hover:opacity-70 transition' xmlns="http://www.w3.org/2000/svg" width="28" height="28" focusable="false" viewBox="0 0 12 12">
                      <path fill="currentColor" d="M6 0a6 6 0 110 12A6 6 0 016 0zm0 1a5 5 0 00-.897 9.92V7.63H3.62V6.043h1.484V4.989c0-1.746.847-2.513 2.29-2.513.693 0 1.058.051 1.231.075v1.384H7.64c-.613 0-.827.584-.827 1.242v.867H8.61l-.244 1.585H6.812v3.305A5.001 5.001 0 006 1z"/>
                    </svg>
                  </a>
                </div>
                </>
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