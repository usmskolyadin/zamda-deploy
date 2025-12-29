'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import CategoryDropdown from '../category-dropdown'
import Image from 'next/image'
import { useAuth } from '@/src/features/context/auth-context';
import SearchBar from '../search-bar'
import { apiFetchAuth } from '@/src/shared/api/auth.client'

export default function Header() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    if (!user) return

    async function fetchUnread() {
      try {
        const data = await apiFetchAuth<{ unread_count: number }>('/api/chats/unread_count/')
        setUnreadCount(data.unread_count)
      } catch (err) {
        console.error('Error:', err)
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user])

  
  return (
        <div className="fixed top-0 w-full z-50">
          <header className="h-[50px] bg-[#333333] w-full p-4 lg:block hidden">
            <div className="max-w-screen-xl flex items-center w-full h-full mx-auto">
              <div className="lg:w-3/4">
                      {/* <div>
                        {user ? (
                        <>
                            <span className="mr-4">Hello, {user.username}</span>
                            <button onClick={logout} className="text-red-500">Logout</button>
                        </>
                        ) : (
                        <Link href="/login">Login</Link>
                        )}
                    </div> */}
              </div>
              <div className="lg:w-2/4 flex justify-between items-center">
              <div className="flex items-center mr-2">
                {user ? (
                  <>
                  
                <Link href={"/notifications"}>
                  <svg className="mr-3 hover:scale-105" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.9813 2.07371C15.2986 3.01205 14.8958 4.16724 14.8958 5.4165C14.8958 8.49286 17.3383 10.9987 20.3899 11.1008C20.3901 11.1049 20.3904 11.109 20.3907 11.113C20.4066 11.3268 20.423 11.5472 20.4453 11.7594C20.7011 14.1942 21.287 15.8645 21.8486 16.9629C22.2226 17.6944 22.5896 18.1793 22.8499 18.4724C22.9802 18.6192 23.0845 18.7185 23.1504 18.777C23.1833 18.8064 23.2067 18.8255 23.219 18.8352L23.2284 18.8426C23.5113 19.0484 23.6309 19.4127 23.5243 19.7466C23.4167 20.0833 23.1037 20.3119 22.7502 20.3119L3.25005 20.3123C2.89654 20.3123 2.58359 20.0838 2.47606 19.7469C2.36944 19.4131 2.48901 19.0488 2.77185 18.843L2.7813 18.8356C2.79358 18.8259 2.81697 18.8067 2.84991 18.7775C2.91577 18.719 3.02001 18.6196 3.15038 18.4728C3.41071 18.1797 3.77759 17.6948 4.15166 16.9632C4.89821 15.5033 5.68755 13.033 5.68755 9.09984C5.68755 7.06183 6.44606 5.09758 7.81111 3.64153C9.17783 2.1837 11.0432 1.354 13.0001 1.354C13.4142 1.354 13.8247 1.39121 14.2275 1.46384C14.4849 1.51023 15.3307 1.77371 15.9813 2.07371Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0189 2.07322C10.7016 3.01156 11.1044 4.16675 11.1044 5.41602C11.1044 8.49237 8.66193 10.9982 5.61039 11.1003C5.61018 11.1044 5.60985 11.1085 5.60953 11.1125C5.5936 11.3264 5.57724 11.5467 5.55493 11.7589C5.29915 14.1937 4.71329 15.864 4.15169 16.9624C3.77761 17.6939 3.41069 18.1788 3.15036 18.4719C3.02004 18.6187 2.91571 18.7181 2.84984 18.7766C2.81691 18.8059 2.79351 18.825 2.78127 18.8347L2.77184 18.8421C2.48898 19.0479 2.36938 19.4123 2.47598 19.7461C2.58356 20.0828 2.89653 20.3114 3.25003 20.3114L22.7502 20.3118C23.1037 20.3118 23.4167 20.0833 23.5242 19.7465C23.6308 19.4126 23.5112 19.0484 23.2284 18.8425L23.2189 18.8352C23.2067 18.8254 23.1833 18.8062 23.1503 18.777C23.0845 18.7185 22.9802 18.6191 22.8499 18.4723C22.5895 18.1792 22.2226 17.6943 21.8486 16.9627C21.102 15.5028 20.3127 13.0325 20.3127 9.09935C20.3127 7.06134 19.5542 5.09709 18.1891 3.64104C16.8224 2.18321 14.9571 1.35352 13.0001 1.35352C12.5861 1.35352 12.1755 1.39072 11.7727 1.46335C11.5153 1.50974 10.6696 1.77322 10.0189 2.07322Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.7182 22.0474C11.1063 21.8221 11.6035 21.9543 11.8287 22.3425C11.9478 22.5476 12.1186 22.718 12.3241 22.8365C12.5297 22.9549 12.7628 23.0172 13 23.0172C13.2373 23.0172 13.4704 22.9549 13.6759 22.8365C13.8815 22.718 14.0524 22.5476 14.1714 22.3425C14.3965 21.9543 14.8938 21.8221 15.2818 22.0474C15.67 22.2725 15.8022 22.7697 15.577 23.1579C15.3151 23.6093 14.9393 23.984 14.487 24.2446C14.0347 24.505 13.522 24.6422 13 24.6422C12.4782 24.6422 11.9653 24.505 11.5131 24.2446C11.0608 23.984 10.6849 23.6093 10.4231 23.1579C10.1979 22.7697 10.33 22.2725 10.7182 22.0474Z" fill="white"/>
                  </svg>
                </Link>
                <Link href={"/messages"} className="relative">
                  <svg width="25" height="25" className="invert mr-3 hover:scale-105" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.2928 21.292L2.28337 21.3026C1.97175 21.6227 1.91001 22.1115 2.1337 22.4995C2.35966 22.8914 2.82058 23.0828 3.25769 22.9662L9.05302 21.4208C10.1339 21.7963 11.2942 22 12.5 22C18.299 22 23 17.299 23 11.5C23 5.70101 18.299 1 12.5 1C6.70103 1 2.00002 5.70101 2.00002 11.5C2.00002 13.6029 2.61921 15.5638 3.6852 17.2072C3.65453 17.5251 3.60229 17.8896 3.51944 18.3039C3.28993 19.4515 2.95112 20.2289 2.68837 20.7019C2.55663 20.939 2.44292 21.1015 2.36973 21.1972C2.3331 21.2451 2.30653 21.2764 2.2928 21.292Z" fill="#000000"/>
                  </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                </Link>
                <Link href={"/favorites"}>
                  <svg className="mr-3 hover:scale-105" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.8334 9.60074C23.8334 11.2761 23.1901 12.8853 22.0414 14.0756C19.3971 16.8166 16.8323 19.6747 14.0892 22.3163C13.4604 22.913 12.463 22.8913 11.8613 22.2676L3.95832 14.0756C1.56956 11.5995 1.56956 7.602 3.95832 5.12587C6.37055 2.6254 10.3003 2.6254 12.7126 5.12587L12.9999 5.42362L13.2869 5.12604C14.4435 3.92654 16.0187 3.25 17.6642 3.25C19.3096 3.25 20.8847 3.92648 22.0414 5.12587C23.1902 6.31632 23.8334 7.92542 23.8334 9.60074Z" fill="white"/>
                  </svg>
                </Link>
                <Link href={"/listings"}>
                  <svg width="28" height="28" className="invert mr-3 hover:scale-105 rounded-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M16.5 7.063C16.5 10.258 14.57 13 12 13c-2.572 0-4.5-2.742-4.5-5.938C7.5 3.868 9.16 2 12 2s4.5 1.867 4.5 5.063zM4.102 20.142C4.487 20.6 6.145 22 12 22c5.855 0 7.512-1.4 7.898-1.857a.416.416 0 0 0 .09-.317C19.9 18.944 19.106 15 12 15s-7.9 3.944-7.989 4.826a.416.416 0 0 0 .091.317z" fill="#000000"/></svg>
                </Link>
                </>
                ) : (
                  <></>
                )}
                </div>
                <Link href="/new">
                <button className="bg-[#2AAEF7] cursor-pointer mx-3 hover:bg-blue-500 transition rounded-3xl h-[36px] w-[200px] text-white flex items-center text-center justify-center">
                  <div className="flex items-center">
                      <svg className="mr-1" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_776_1837)">
                          <path d="M5.33325 8.00016H7.99992M7.99992 8.00016H10.6666M7.99992 8.00016V5.3335M7.99992 8.00016V10.6668" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.682 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.682 4.31802 14.6668 7.99992 14.6668Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_776_1837">
                          <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    Place an ad
                  </div>
                </button>
                </Link>
                {user ? (
                  <div className="relative group">
                    <div className="flex items-center cursor-pointer">
                      <h2 className="mr-2 font-semibold text-white ml-2 w-36 text-right">
                        {user?.first_name}
                      </h2>
                      <img
                        className="rounded-full w-10 h-10 object-cover"
                        src={user?.profile?.avatar}
                        alt=""
                      />
                    </div>

                    <div className="absolute right-0 top-full h-3 w-full"></div>

                    <div
                      className="
                        absolute right-0 top-full mt-3 w-48
                        bg-white rounded-3xl shadow-xl
                        border border-gray-200
                        z-50

                        opacity-0 translate-y-2
                        pointer-events-none

                        transition-all duration-100 ease-out
                        group-hover:opacity-100
                        group-hover:translate-y-0
                        group-hover:pointer-events-auto font-medium
                      "
                    >
                      <div className="py-3 flex flex-col border-b  border-gray-200">
                        <Link className=" py-1.5 hover:bg-gray-100 text-[#2AAEF7]" href="/listings">
                          <div className="px-6 hover:bg-gray-100 border-b border-black py-2 flex items-center cursor-pointer">
                            <h2 className="mr-2 font-semibold text-black w-24">
                              {user?.first_name} <br />
                              {user?.last_name}
                            </h2>
                            <img
                              className="rounded-full w-10 h-10 object-cover"
                              src={user?.profile?.avatar}
                              alt=""
                            />
                          </div>
                        </Link>
                        <Link className="px-6 py-1.5 hover:bg-gray-100 text-[#2AAEF7]" href="/listings">
                          My Listings
                        </Link>
                        <Link className="px-6 py-1.5 hover:bg-gray-100 text-[#2AAEF7]" href="/favorites">
                          Favorites
                        </Link>
                        <Link className="px-6 py-1.5 hover:bg-gray-100 text-[#2AAEF7]" href="/messages">
                          Messages
                        </Link>
                        <Link
                          className="px-6 py-1.5 hover:bg-gray-100 text-[#2AAEF7]"
                          href={`/reviews/${user?.profile?.id}`}
                        >
                          My Reviews
                        </Link>
                        <Link
                          className="px-6 py-1.5 hover:bg-gray-100 text-[#2AAEF7]"
                          href="/profile/edit"
                        >
                          Profile settings
                        </Link>
                      </div>

                      <div className="py-2 flex flex-col">
                        <button
                          className="px-6 cursor-pointer rounded-3xl text-left py-2 hover:bg-gray-100 text-red-500"
                          onClick={logout}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>

                  ) : (
                    <p className='ml-8 w-36 text-right text-white'><Link href={"/login"}>Sign in</Link> | <Link href={"/register"}>Sign up</Link></p>
                  )
                }
              </div>
            </div>
          </header>
          <nav className="flex lg:h-[80px] h-[140px] bg-white items-center shadow-lg p-4 ">
            <div className="max-w-screen-xl mx-auto lg:flex items-center w-full justify-between">
              <div className="flex items-center justify-between">
                <Link href={"/"}>
                  <div className="flex items-center">
                    <Image src={"/zamda-white.png"} width={1000} height={1000} className="w-10 h-10" alt={""} />
                    <h1 className=" mr-12 font-bold text-4xl text-black">Zamda</h1>
                  </div>
                </Link>
                
                <CategoryDropdown />

              </div>

              <SearchBar />
              <div className="lg:flex hidden items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="ml-2 text-black">
                  {user ? (
                    user.profile?.city ? (
                      user.profile.city
                    ) : (
                      <Link href="/profile/edit" className="text-black hover:underline">
                        Set your city
                      </Link>
                    )
                  ) : (
                    <Link href="/login" className="text-black hover:underline">
                      Set your city
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </nav>
        </div>
  )
}
