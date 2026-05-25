"use client"

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { useAuth } from '@/src/features/context/auth-context';

export default function Footer() {
  const { user, logout } = useAuth();
    
  return (
    <div>
        <footer className="lg:h-[125px] bg-[#333333] w-full lg:p-6 p-4 lg:mb-0 mb-18 lg:block hidden">
          <div className="max-w-screen-xl lg:flex justify-between items-center w-full h-full mx-auto px-4 sm:px-6 lg:px-12">
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
              <div className="mt-2 mb-2 lg:text-md text-sm lg:mt-0">
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/about">About</Link>
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/terms">Terms of Use</Link>
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/policy">Privacy Policy</Link>
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/guidelines">Community Guidelines</Link>
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/items">Prohibited Items</Link>
                  <Link className="hover:underline lg:w-48 w-90 lg:mr-12 mr-4 text-white" href="/help">Help</Link>
              </div>
                <>
                <div className="flex items-center gap-4 lg:mt-0 mt-2">
                  <a target='_blank' href="https://www.instagram.com/zamdamazing?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr">
                    <svg className='invert hover:opacity-70 transition' width={28} height={28} enableBackground="new 0 0 512 512" id="Layer_1" version="1.1" viewBox="0 0 512 512"  xmlns="http://www.w3.org/2000/svg"><g><path d="M505,257c0,34.8-0.7,69.7,0.2,104.5c1.5,61.6-37.2,109.2-86.5,130.4c-19.8,8.5-40.6,13-62.1,13c-67.3,0.1-134.7,1-202-0.3   c-50.7-1-92.4-22.2-122.3-64c-15.7-22-23.2-47-23.2-74.1c0-71.7,0-143.3,0-215c0-58.5,28.5-99.4,79.1-126C110.2,14,134.1,9.1,159,9   c65.3,0,130.7-0.4,196,0.2c50.7,0.4,93,19.8,124.2,60.6c17.4,22.8,25.8,49,25.8,77.8C505,184,505,220.5,505,257z M46,257   c0,36.7,0,73.3,0,110c0,16.4,3.8,31.8,12.3,45.7c22.3,36.5,56,54.3,97.8,55c67.1,1,134.3,0.4,201.5,0.2c16.5,0,32.5-3.4,47.4-10.5   c40.6-19.4,63.3-50.3,63.1-96.7c-0.4-71-0.1-142-0.1-213c0-20.1-5.7-38.5-17.6-54.7c-23-31.1-54.8-46.4-92.8-46.8   c-67-0.8-134-0.3-201-0.2c-14.3,0-28.1,2.9-41.5,7.9c-36.8,13.7-71,48.4-69.4,99.5C46.9,188,46,222.5,46,257z"/><path d="M257.6,363c-64.5,0-116.5-51.4-116.6-115.4c-0.1-63,52.3-114.6,116.4-114.6c64.3-0.1,116.5,51.4,116.6,114.9   C374,311.3,321.9,362.9,257.6,363z M257.6,326c43.9,0,79.5-35.1,79.4-78.3c-0.1-42.8-35.7-77.8-79.4-77.8   c-43.9,0-79.7,34.9-79.7,78C178,291.1,213.7,326.1,257.6,326z"/><path d="M387.5,98c13.5,0,24.5,11.5,24.5,25.6c-0.1,14.1-11.2,25.5-24.7,25.4c-13.3-0.1-24.2-11.5-24.2-25.3   C363,109.6,374,98,387.5,98z"/></g></svg>
                  </a>
                  
                  <a target='_blank' href="https://www.facebook.com/ZAMDAmazing/">
                    <svg className='hover:opacity-70 transition text-white' xmlns="http://www.w3.org/2000/svg" width="28" height="28" focusable="false" viewBox="0 0 12 12">
                      <path fill="currentColor" d="M6 0a6 6 0 110 12A6 6 0 016 0zm0 1a5 5 0 00-.897 9.92V7.63H3.62V6.043h1.484V4.989c0-1.746.847-2.513 2.29-2.513.693 0 1.058.051 1.231.075v1.384H7.64c-.613 0-.827.584-.827 1.242v.867H8.61l-.244 1.585H6.812v3.305A5.001 5.001 0 006 1z"/>
                    </svg>
                  </a>

                  <a target='_blank' href="https://www.youtube.com/@ZamdaMarketplace">
                    <svg className='hover:opacity-70 transition' xmlns="http://www.w3.org/2000/svg"  fill="#ffffff" width="34" height="34" version="1.1" id="Capa_1" viewBox="0 0 209.673 209.673" >
                    <g>
                      <path d="M173.075,29.203H36.599C16.418,29.203,0,45.626,0,65.812v78.05c0,20.186,16.418,36.608,36.599,36.608h136.477   c20.18,0,36.598-16.422,36.598-36.608v-78.05C209.673,45.626,193.255,29.203,173.075,29.203z M194.673,143.861   c0,11.915-9.689,21.608-21.598,21.608H36.599c-11.91,0-21.599-9.693-21.599-21.608v-78.05c0-11.915,9.689-21.608,21.599-21.608   h136.477c11.909,0,21.598,9.693,21.598,21.608V143.861z"/>
                      <path d="M145.095,98.57L89.499,61.92c-2.303-1.519-5.254-1.649-7.684-0.342c-2.429,1.308-3.944,3.845-3.944,6.604v73.309   c0,2.759,1.515,5.295,3.944,6.604c1.113,0.6,2.336,0.896,3.555,0.896c1.442,0,2.881-0.415,4.129-1.239l55.596-36.659   c2.105-1.388,3.372-3.74,3.372-6.262C148.467,102.31,147.2,99.958,145.095,98.57z M92.871,127.562V82.109l34.471,22.723   L92.871,127.562z"/>
                    </g>
                    </svg>
                  </a>
                </div>
                </>
          </div>
        </footer>
        <footer className="bg-[#333] text-white w-full mb-14 lg:hidden block">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

            <div className="flex flex-col gap-8">

              <div className="flex flex-col gap-2">
                <Link href="/" className="flex items-center gap-2 active:scale-95 transition">
                  <Image
                    src="/zamda-white.png"
                    width={40}
                    height={40}
                    alt="Zamda"
                  />
                  <span className="text-2xl font-bold">Zamda</span>
                </Link>

                <p className="text-gray-400 text-sm">
                  © 2025 Zamda. All rights reserved.
                </p>

                <div className="flex items-center gap-4 lg:mt-0 mt-2">
                  <a target='_blank' href="https://www.instagram.com/zamdamazing?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr">
                    <svg className='invert hover:opacity-70 transition' width={28} height={28} enableBackground="new 0 0 512 512" id="Layer_1" version="1.1" viewBox="0 0 512 512"  xmlns="http://www.w3.org/2000/svg"><g><path d="M505,257c0,34.8-0.7,69.7,0.2,104.5c1.5,61.6-37.2,109.2-86.5,130.4c-19.8,8.5-40.6,13-62.1,13c-67.3,0.1-134.7,1-202-0.3   c-50.7-1-92.4-22.2-122.3-64c-15.7-22-23.2-47-23.2-74.1c0-71.7,0-143.3,0-215c0-58.5,28.5-99.4,79.1-126C110.2,14,134.1,9.1,159,9   c65.3,0,130.7-0.4,196,0.2c50.7,0.4,93,19.8,124.2,60.6c17.4,22.8,25.8,49,25.8,77.8C505,184,505,220.5,505,257z M46,257   c0,36.7,0,73.3,0,110c0,16.4,3.8,31.8,12.3,45.7c22.3,36.5,56,54.3,97.8,55c67.1,1,134.3,0.4,201.5,0.2c16.5,0,32.5-3.4,47.4-10.5   c40.6-19.4,63.3-50.3,63.1-96.7c-0.4-71-0.1-142-0.1-213c0-20.1-5.7-38.5-17.6-54.7c-23-31.1-54.8-46.4-92.8-46.8   c-67-0.8-134-0.3-201-0.2c-14.3,0-28.1,2.9-41.5,7.9c-36.8,13.7-71,48.4-69.4,99.5C46.9,188,46,222.5,46,257z"/><path d="M257.6,363c-64.5,0-116.5-51.4-116.6-115.4c-0.1-63,52.3-114.6,116.4-114.6c64.3-0.1,116.5,51.4,116.6,114.9   C374,311.3,321.9,362.9,257.6,363z M257.6,326c43.9,0,79.5-35.1,79.4-78.3c-0.1-42.8-35.7-77.8-79.4-77.8   c-43.9,0-79.7,34.9-79.7,78C178,291.1,213.7,326.1,257.6,326z"/><path d="M387.5,98c13.5,0,24.5,11.5,24.5,25.6c-0.1,14.1-11.2,25.5-24.7,25.4c-13.3-0.1-24.2-11.5-24.2-25.3   C363,109.6,374,98,387.5,98z"/></g></svg>
                  </a>
                  
                  <a target='_blank' href="https://www.facebook.com/ZAMDAmazing/">
                    <svg className='hover:opacity-70 transition text-white' xmlns="http://www.w3.org/2000/svg" width="28" height="28" focusable="false" viewBox="0 0 12 12">
                      <path fill="currentColor" d="M6 0a6 6 0 110 12A6 6 0 016 0zm0 1a5 5 0 00-.897 9.92V7.63H3.62V6.043h1.484V4.989c0-1.746.847-2.513 2.29-2.513.693 0 1.058.051 1.231.075v1.384H7.64c-.613 0-.827.584-.827 1.242v.867H8.61l-.244 1.585H6.812v3.305A5.001 5.001 0 006 1z"/>
                    </svg>
                  </a>
                  <a target='_blank' href="https://www.youtube.com/@ZamdaMarketplace">
                    <svg className='hover:opacity-70 transition' xmlns="http://www.w3.org/2000/svg"  fill="#ffffff" width="34" height="34" version="1.1" id="Capa_1" viewBox="0 0 209.673 209.673" >
                    <g>
                      <path d="M173.075,29.203H36.599C16.418,29.203,0,45.626,0,65.812v78.05c0,20.186,16.418,36.608,36.599,36.608h136.477   c20.18,0,36.598-16.422,36.598-36.608v-78.05C209.673,45.626,193.255,29.203,173.075,29.203z M194.673,143.861   c0,11.915-9.689,21.608-21.598,21.608H36.599c-11.91,0-21.599-9.693-21.599-21.608v-78.05c0-11.915,9.689-21.608,21.599-21.608   h136.477c11.909,0,21.598,9.693,21.598,21.608V143.861z"/>
                      <path d="M145.095,98.57L89.499,61.92c-2.303-1.519-5.254-1.649-7.684-0.342c-2.429,1.308-3.944,3.845-3.944,6.604v73.309   c0,2.759,1.515,5.295,3.944,6.604c1.113,0.6,2.336,0.896,3.555,0.896c1.442,0,2.881-0.415,4.129-1.239l55.596-36.659   c2.105-1.388,3.372-3.74,3.372-6.262C148.467,102.31,147.2,99.958,145.095,98.57z M92.871,127.562V82.109l34.471,22.723   L92.871,127.562z"/>
                    </g>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">

                {[
                  ["About", "/about"],
                  ["Terms", "/terms"],
                  ["Privacy", "/policy"],
                  ["Guidelines", "/guidelines"],
                  ["Prohibited", "/items"],
                  ["Help", "/help"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="
                      text-gray-300
                      active:text-white
                      hover:text-white
                      transition
                      active:scale-95
                      transform
                      block
                    "
                  >
                    {label}
                  </Link>
                ))}

              </div>

            </div>

            <div className="mt-10 border-t border-gray-500 pt-4 text-xs text-gray-400 text-center">
              © 2025 Zamda. All rights reserved.
            </div>

          </div>
        </footer>
    </div>
  )
}