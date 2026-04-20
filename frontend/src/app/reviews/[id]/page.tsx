"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { apiFetch } from "@/src/shared/api/base";
import { Profile } from "../../profile/[id]/page";
import Link from "next/link";
import { useAuth } from "@/src/features/context/auth-context";
import BackButton from "@/src/widgets/back-button";
import { apiFetchAuth } from "@/src/shared/api/auth";
import Sidebar from "@/src/widgets/sidebar";

export default function ReviewsPage() {

  const params = useParams();
  const profileId = Number(params.id);

  const { user, accessToken } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [reportOpen, setReportOpen] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportText, setReportText] = useState("");
  const [activeTab, setActiveTab] = useState<"for_me" | "by_me">("for_me");
  const [myReviews, setMyReviews] = useState<any[]>([]);
  
  const isOwner = profile?.username === user?.username;
  

  useEffect(() => {
  if (!accessToken) return;

  const fetchMyReviews = async () => {
    const res = await apiFetchAuth("/api/reviews/my/");
    setMyReviews(res);
  };

  fetchMyReviews();
}, [accessToken]);

const deleteReview = async (id: number) => {
  await apiFetchAuth(`/api/reviews/${id}/`, {
    method: "DELETE",
  });

  setMyReviews((prev) => prev.filter((r) => r.id !== id));
};

  useEffect(() => {

    if (!profileId) return;

    const fetchProfile = async () => {
      const res = await apiFetch<Profile>(`/api/profiles/${profileId}/`);
      setProfile(res);
    };
    

    fetchProfile();

  }, [profileId]);

  if (!profile)
    return (
      <div className="text-black bg-white h-screen flex justify-center items-center">
        Loading...
      </div>
    );

  const refresh = async () => {
    const res = await apiFetch<Profile>(`/api/profiles/${profileId}/`);
    setProfile(res);
  };

  const submitReply = async (reviewId: number) => {

    if (!replyText) return;

    await apiFetchAuth("/api/review-replies/", {
      method: "POST",
      body: JSON.stringify({
        review: reviewId,
        comment: replyText,
      }),
    });

    setReplyOpen(null);
    setReplyText("");
    refresh();
  };

  const submitReport = async (reviewId: number) => {

    await apiFetchAuth("/api/review-reports/", {
      method: "POST",
      body: JSON.stringify({
        review: reviewId,
        reason: reportReason,
        description: reportText,
      }),
    });

    setReportOpen(null);
    setReportText("");
  };

  return (
    <div className="w-full ">

      <section className="bg-white min-h-screen pb-16 p-4">

        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">

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
                  {profile.city ? (
                <p className=" flex text-gray-700 font-medium items-center text-lg py-2">
                    <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                            <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                    {profile.city} 
                    <></>
                </p>
                  ) : (<></>
                  )}

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
                <span className="text-[#2AAEF7] cursor-pointer hover:underline text-lg ml-1">
                  <Link href={`/reviews/${profile.id}`}>All reviews</Link>
                </span>
              </div>
            </div>
          </div>
          <div className="lg:w-3/4 lg:ml-24 mt-2">

            <div className="flex">
              <BackButton className="mr-2 px-2 py-0" />
              <h1 className="text-black font-bold text-4xl">Reviews</h1>

            </div>
<div className={`grid ${isOwner ? "grid-cols-2" : "grid-cols-1"} border-b mb-6 mt-4`}>

  <button
    className={`cursor-pointer text-lg font-bold pb-2 ${
      activeTab === "for_me"
        ? "text-black border-b-4 border-black"
        : "text-gray-400"
    }`}
    onClick={() => setActiveTab("for_me")}
  >
    Reviews {isOwner ? "For me" : profile.first_name }
  </button>

  {isOwner && (
    <button
      className={`cursor-pointer text-lg font-bold pb-2 ${
        activeTab === "by_me"
          ? "text-black border-b-4 border-black"
          : "text-gray-400"
      }`}
      onClick={() => setActiveTab("by_me")}
    >
      Reviews by Me
    </button>
  )}

</div>
            <div className="mt-4">

{!isOwner && (
  <Link
    className="px-4 py-3 bg-[#36B731] hover:bg-green-500 cursor-pointer text-white rounded-3xl"
    href={accessToken ? `/reviews/add/${profile.id}` : "/login"}
  >
    Add review
  </Link>
)}

            </div>
            {activeTab === "for_me" && (
            <div className="space-y-4 mt-6">

              {profile.reviews?.map((review) => (

                <div
                  key={review.id}
                  className="bg-gray-100 p-4 rounded-3xl"
                >

                  <div className="flex justify-between">

                    <span className="font-semibold text-black">
                      {review.author_lastname} {review.author_firstname}
                    </span>

                    <span className="text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>

                  </div>

                  <div className="flex items-center text-yellow-400 my-1">
                    <p className="mr-2 text-black font-semibold">
                      {review.rating}
                    </p>
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "" : "opacity-30"}
                      />
                    ))}

                  </div>

                  <p className="text-gray-800">{review.comment}</p>
{review.images?.length > 0 && (
  <div className="flex gap-2 mt-3 flex-wrap">
    {review.images.map((img: any) => (
      <img
        key={img.id}
        src={img.image}
        className="w-24 h-24 object-cover rounded-xl"
      />
    ))}
  </div>
)}
                  <div className="flex gap-4 mt-3 text-sm">

                    {profile.username === user?.username && !review.reply && (
                      <button
                        className="text-blue-600 rounded-3xl cursor-pointer hover:underline"
                        onClick={() => setReplyOpen(review.id)}
                      >
                        Reply
                      </button>
                    )}


                    {review.author !== user?.id && (
                      <button
                        className="text-red-500 rounded-3xl cursor-pointer hover:underline"
                        onClick={() => setReportOpen(review.id)}
                      >
                        Report
                      </button>
                    )}

                  </div>

                  {replyOpen === review.id && (

                    <div className="mt-3">

                      <textarea
                        className="w-full p-3 rounded-3xl border border-black text-black"
                        placeholder="Write reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />

                      <div className="flex gap-2 mt-2">

                        <button
                          onClick={() => submitReply(review.id)}
                          className="bg-blue-600 rounded-3xl cursor-pointer text-white px-4 py-2 rounded-xl"
                        >
                          Send
                        </button>

                        <button
                          onClick={() => setReplyOpen(null)}
                          className="px-4 py-2 rounded-3xl cursor-pointer rounded-xl border"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  )}

                  {reportOpen === review.id && (

                    <div className="mt-3 bg-red-50 text-black p-3 rounded-xl">

                      <select
                        className="border border-black p-2 rounded-2xl"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      >
                        <option value="spam">Spam</option>
                        <option value="abuse">Abuse</option>
                        <option value="fake">Fake review</option>
                        <option value="other">Other</option>
                      </select>

                      <textarea
                        className="w-full mt-2 p-2 border rounded-2xl"
                        placeholder="Description"
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                      />

                      <div className="flex gap-2 mt-2">

                        <button
                          onClick={() => submitReport(review.id)}
                          className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-3xl"
                        >
                          Send report
                        </button>

                        <button
                          onClick={() => setReportOpen(null)}
                          className="border cursor-pointer px-4 py-2 rounded-3xl"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  )}

                  {review.reply && (
                  <div className="mt-4 flex items-start gap-2">

                    <div className="text-gray-800 text-4xl mt-1">
                      ↳
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-lg text-black mb-2">
                        Seller's answer:
                      </div>

                      <div className=" rounded-2xl">
                        <div className="font-semibold text-black">
                          {review.reply.author_firstname} {review.reply.author_lastname}
                        </div>

                        <div className="text-gray-700">
                          {review.reply.comment}
                        </div>
                      </div>
                    </div>

                  </div>

                  )}

                </div>

              ))}

            </div>
            )}
{isOwner && activeTab === "by_me" && (
  <div className="space-y-4">

    {myReviews.length === 0 && (
      <p className="text-gray-500">You haven’t left any reviews yet</p>
    )}

    {myReviews.map((review) => (

      <div key={review.id} className="bg-gray-100 p-4 rounded-3xl">

        <div className="flex justify-between">

          <span className="font-semibold text-black">
            <Link
              href={`/profile/${review.target_profile_id}`}
              className="font-semibold text-black hover:underline"
            >
              {review.target_firstname} {review.target_lastname}
            </Link>
          </span>

          <span className="text-gray-500">
            {new Date(review.created_at).toLocaleDateString()}
          </span>

        </div>

        <div className="flex items-center text-yellow-400 my-1">

          <p className="mr-2 text-black font-semibold">
            {review.rating}
          </p>

          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < review.rating ? "" : "opacity-30"}
            />
          ))}

        </div>

        <p className="text-gray-800">{review.comment}</p>
          {review.images?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.images.map((img: any) => (
                <img
                  key={img.id}
                  src={img.image}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              ))}
            </div>
          )}
        <div className="mt-3 flex justify-between items-center">
          {review.reply && (
            <span className="text-sm text-gray-500">
              Seller replied
            </span>
          )}

          <button
            onClick={() => deleteReview(review.id)}
            className="text-red-500 hover:underline text-sm cursor-pointer"
          >
            Delete
          </button>

        </div>

      </div>

    ))}

  </div>
)}
          </div>

        </div>

      </section>

    </div>
  );
}