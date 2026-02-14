"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { apiFetch } from "@/src/shared/api/base";
import { Profile } from "../../profile/[id]/page";
import Link from "next/link";
import { useAuth } from "@/src/features/context/auth-context";
import BackButton from "@/src/widgets/back-button";
import Sidebar from "@/src/widgets/sidebar";

export default function ReviewsPage() {
  const params = useParams();
  const profileId = Number(params.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user, accessToken } = useAuth();

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
          <Sidebar />

          <div className="lg:w-3/4 lg:ml-24 h-screen mt-2">
            <div className="flex">
              <BackButton className="mr-2 px-2 py-0" />
              <h1 className="text-black font-bold lg:text-4xl text-3xl py-1">
                Reviews
              </h1>
            </div>
            <div className="mt-4">
            {(profile.username == user?.username) ? (
              <>
              </>
            ) : (
              <Link 
                className=" px-4 py-3 mb-4 mt-2 bg-[#36B731] hover:bg-green-500 transition text-white rounded-3xl text-center"
                href={accessToken ? (`/reviews/add/${profile.id}`) : ("/login")}>
                Add review
              </Link>
            )}
            </div>

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
                <p className="text-gray-600">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
