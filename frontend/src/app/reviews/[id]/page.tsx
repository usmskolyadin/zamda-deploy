"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { apiFetch } from "@/src/shared/api/base";
import { Profile } from "../../profile/[id]/page";
import Link from "next/link";
import { useAuth } from "@/src/features/context/auth-context";

export default function ReviewsPage() {
  const params = useParams();
  const profileId = Number(params.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      const res = await apiFetch<Profile>(`/api/profiles/${profileId}/`);
      setProfile(res);
      console.log(res)
    };

    fetchProfile();
  }, [profileId]);

  if (!profile) return <div className="text-black bg-white h-screen justify-center items-center flex">Loading...</div>;
  const rating = Math.min(5, Math.max(0, Math.round(user?.profile.rating || 0)));

  return (
    <div className="w-full ">
      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4">
            <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
              <img
                src={profile.avatar}
                width={200}
                height={200}
                alt="Avatar"
                className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
              />
              <div className="py-2">
                <h2 className="text-black font-bold lg:text-2xl text-3xl">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="flex text-gray-700 font-medium items-center text-lg py-2">
                  <svg
                    className="mr-1"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z"
                        stroke="black"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z"
                        fill="black"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                  {profile.city ? profile.city : "No city selected"}
                </p>
                <h2 className="text-gray-800 font-medium text-md">
                  {profile.username}
                </h2>
              </div>

              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-1 text-black text-lg font-bold">
                  {profile.rating ?? "—"}
                </span>
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(profile.rating) ? "" : "opacity-30"}
                    />
                  ))}
                </div>
                <span className="text-[#2AAEF7] text-lg ml-1">
                  {profile.reviews_count} reviews
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 lg:ml-24 h-screen">
            <h1 className="text-black font-bold lg:text-4xl text-3xl py-4">
              Reviews
            </h1>
            {(profile.username == user?.username) ? (
              <>
              </>
            ) : (
              <Link 
                className=" px-4 py-3 mb-4 mt-2 bg-[#36B731] hover:bg-green-500 transition text-white rounded-3xl text-center"
                href={`/reviews/add/${profile.id}`}>
                Add review
              </Link>
            )}

            <div className="space-y-4 mt-4">
              {profile.reviews && profile.reviews.length > 0 ? (
                profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-100 p-4 rounded-3xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-black text-lg">
                        {review.author_lastname} {review.author_firstname}
                      </span>
                      <span className="text-md text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400 my-1">
                      <p className="mr-2 text-black text-lg font-semibold">{review.rating}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? "w-5" : "opacity-30"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-800 text-lg">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 italic">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
