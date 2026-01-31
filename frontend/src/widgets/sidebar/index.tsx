import { useAuth } from '@/src/features/context/auth-context';
import Link from 'next/link';
import React from 'react'
import { FaStar } from 'react-icons/fa'

type SidebarProps = {
  notHideOnPhone?: boolean;
};

export default function Sidebar({notHideOnPhone}: SidebarProps) {
  const { user, logout } = useAuth();
  const rating = Math.min(5, Math.max(0, Math.round(user?.profile.rating || 0)));

  return (
          <div className={`lg:w-1/4 ${notHideOnPhone ? ("") : ("hidden lg:block")}`}>
            <div className="max-w-[712px]">
                  <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
                    <img
                        src={user?.profile.avatar}
                        width={200}
                        height={200}
                        alt="Your avatar"
                        className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover "
                    />
                    <div>
                    <div className="py-2">
                        <h2 className="text-black font-bold  lg:text-2xl text-3xl ">{user?.first_name} {user?.last_name}</h2>
                      <h2 className="text-gray-800 font-medium  text-md">{user?.username}</h2>
                    </div>

                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">{user?.profile.rating}</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(5)].map((_, i) => (
                            <FaStar 
                                key={i}
                                className={i < rating ? "text-yellow-400" : "text-yellow-400 opacity-30"}
                             />
                        ))}
                        </div>
                        <Link className="hover:underline text-[#2AAEF7] " href={`/reviews/${user?.profile?.id ?? 0}`}>
                          <span className="text-lg ml-1">
                            {user?.profile?.reviews_count ?? 0} reviews
                          </span>
                        </Link> 
                    </div>
                    <div className="lg:hidden block py-4">
                      <Link href={"/new"}>
                        <button className="w-full p-4 bg-blue-500 rounded-3xl cursor-pointer hover:bg-green-500 transition ">Place an ad</button>
                      </Link>
                      <Link href={"/profile/edit"}>
                        <button className="w-full mt-2 p-4 bg-[#36B731] rounded-3xl cursor-pointer hover:bg-green-500 transition ">Edit profile</button>
                      </Link>
                      <div className='pt-4'>
                          <button onClick={logout} className="w-full mt-2 px-4 py-4 bg-red-400 rounded-3xl cursor-pointer hover:bg-red-500 transition ">Logout</button>
                      </div>
                    </div>
                    </div>
                </div>
            </div>
            <div className="lg:block hidden">
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link className="hover:underline text-[#2AAEF7]" href="/listings"><span className="text-[#2AAEF7] text-md h-12">My Listings</span> </Link>
                    <Link className="hover:underline text-[#2AAEF7]" href="/favorites"><span className="text-[#2AAEF7] text-md h-12">Favorites</span></Link>
                    <Link className="hover:underline text-[#2AAEF7]" href="/messages"><span className="text-[#2AAEF7] text-md h-12">Messages</span></Link>
                    <Link className="hover:underline text-[#2AAEF7]" href={`/reviews/${user?.profile.id}`}><span className="text-[#2AAEF7] text-md h-12">My Reviews</span> </Link>
                </div>
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="favorites"><span className="text-[#2AAEF7] text-md h-12">Paid services</span></Link>
                </div>
                <div className="py-3 flex flex-col mb-4">
                    <Link className="hover:underline text-[#2AAEF7]" href="/profile/edit"><span className="text-[#2AAEF7] text-md h-12">Profile settings</span> </Link>
                </div>
            </div>
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[500px] lg:flex hidden  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
          </div>
  )
}
