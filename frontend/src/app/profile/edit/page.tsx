"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { API_URL } from "@/src/shared/api/base";
import Sidebar from "@/src/widgets/sidebar";
import { apiFetchAuth } from "@/src/shared/api/auth";

export default function ProfileEdit() {
  const { updateUser, isInitialized, accessToken, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"general" | "profile">("general");

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    city: "",
    avatar: null as File | null,
  });

  const [generalData, setGeneralData] = useState({
    email: "",
    password: "",
    password2: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isInitialized) return;

    const fetchProfile = async () => {
      try {
        const data: any = await apiFetchAuth("api/users/me/");

        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          city: data.profile?.city || "",
          avatar: null,
        });

        setGeneralData((prev) => ({
          ...prev,
          email: data.email || "",
        }));

        setAvatarPreview(data.profile?.avatar || null);
      } catch (err) {
        router.push("/login");
      }
    };

    fetchProfile();
  }, [isInitialized]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files[0]) {
      const file = files[0];

      setProfileData((prev) => ({
        ...prev,
        avatar: file,
      }));

      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setGeneralData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const updateProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const body = new FormData();
    body.append("first_name", profileData.first_name);
    body.append("last_name", profileData.last_name);
    body.append("city", profileData.city);
    if (profileData.avatar) body.append("avatar", profileData.avatar);

    const res = await fetch(`${API_URL}/api/users/me/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Failed to update" }));
      setError(data.detail || "Failed to update profile");
      return;
    }

    const updatedProfile = await res.json().catch(() => null);

    // Обновляем локальный user корректно
    if (user) {
      updateUser({
        ...user,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        profile: {
          ...user.profile,
          city: profileData.city,
          avatar: updatedProfile?.avatar || avatarPreview || user.profile.avatar,
        },
      });
    }

    setSuccess("Profile updated successfully!");
  } catch (err: any) {
    console.error(err);
    setError("Network error. Try again later.");
  }
};


const updateGeneral = async (e: React.FormEvent) => {
  e.preventDefault();

  if (generalData.password !== generalData.password2) {
    setError("Passwords do not match");
    return;
  }

  try {
    await apiFetchAuth("api/users/me/", {
      method: "PATCH",
      body: JSON.stringify({
        email: generalData.email,
        password: generalData.password || undefined,
      }),
    });

    setSuccess("General settings updated");
    setError("");
  } catch (err: any) {
    setError(err.message || "Error updating settings");
  }
};


  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">

          <Sidebar notHideOnPhone={true} />

          <div className="lg:w-3/4 lg:ml-24">

            {/* <div className="rounded-[50px] w-full bg-[#F2F1F0] h-[200px] flex justify-center items-center mb-6">
              <h2 className="text-[#333333] text-[50px] font-bold opacity-40">
                Your Ad Here
              </h2>
            </div> */}

            <div className="bg-white rounded-[50px] p-6">
              <div className="grid grid-cols-2 border-b mb-6">

                <button
                  className={`cursor-pointer text-lg font-bold pb-2 ${
                    activeTab === "general"
                      ? "text-black border-b-4 border-black"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  General
                </button>

                <button
                  className={`cursor-pointer text-lg font-bold pb-2 ${
                    activeTab === "profile"
                      ? "text-black border-b-4 border-black"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>

              </div>

{activeTab === "general" && (
  <form onSubmit={updateGeneral} className="max-w-full mx-auto space-y-6">

    {/* Email */}

    <label className="w-full flex-col flex">
      <p className="font-semibold text-black text-xl">Email</p>
      <p className="text-gray-700 text-sm font-medium">
        This email will be used for login and notifications
      </p>

      <input
        type="email"
        name="email"
        value={generalData.email}
        onChange={handleGeneralChange}
        className="p-4 border border-black rounded-[50px] mt-1 text-gray-900"
        required
      />
    </label>


    {/* Change password */}

    <div className="flex flex-col">

      <p className="font-semibold text-black text-xl">Password</p>
      <p className="text-gray-700 text-sm font-medium">
        For security reasons password is changed separately
      </p>

      <button
        type="button"
        onClick={() => router.push("/change-password")}
        className="cursor-pointer mt-2 border border-black hover:bg-black hover:text-white transition h-[44px] w-[200px] rounded-[50px] flex items-center justify-center text-black font-medium"
      >
        Change password
      </button>

    </div>

    <button
      type="submit"
      className="cursor-pointer mt-4 bg-black w-[160px] h-[44px] rounded-[50px] flex justify-center items-center text-white"
    >
      Save changes
    </button>

  </form>
)}
{activeTab === "profile" && (
  <form onSubmit={updateProfile} className="max-w-full mx-auto space-y-6">

    {/* Avatar */}

    <label className="w-full flex-col flex">
      <p className="font-semibold text-black text-xl">Avatar</p>
      <p className="text-gray-700 text-sm font-medium">
        Upload a profile picture (recommended 512x512)
      </p>

      {avatarPreview && (
        <div className="flex flex-col items-center py-3">
          <img
            src={avatarPreview}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      )}

      <input
        type="file"
        name="avatar"
        onChange={handleProfileChange}
        className="cursor-pointer p-4 border border-black rounded-[50px] mt-1 text-gray-900"
      />
    </label>


    {/* First + Last name */}

    <div className="grid grid-cols-2 gap-4">

      <label className="flex flex-col">
        <p className="font-semibold text-black text-xl">First name</p>
        <p className="text-gray-700 text-sm font-medium">
          Your real first name
        </p>

        <input
          name="first_name"
          value={profileData.first_name}
          onChange={handleProfileChange}
          className="p-4 border border-black rounded-[50px] mt-1 text-gray-900"
          required
        />
      </label>

      <label className="flex flex-col">
        <p className="font-semibold text-black text-xl">Last name</p>
        <p className="text-gray-700 text-sm font-medium">
          Your real last name
        </p>

        <input
          name="last_name"
          value={profileData.last_name}
          onChange={handleProfileChange}
          className="p-4 border border-black rounded-[50px] mt-1 text-gray-900"
          required
        />
      </label>

    </div>


    {/* City */}

    <label className="w-full flex-col flex">
      <p className="font-semibold text-black text-xl">City</p>
      <p className="text-gray-700 text-sm font-medium">
        Your current location
      </p>

      <input
        name="city"
        value={profileData.city}
        onChange={handleProfileChange}
        className="p-4 border border-black rounded-[50px] mt-1 text-gray-900"
      />
    </label>


    <button
      type="submit"
      className="cursor-pointer mt-4 bg-black w-[160px] h-[44px] rounded-[50px] flex justify-center items-center text-white"
    >
      Save profile
    </button>

  </form>
)}

              {error && (
                <p className="text-red-500 mt-4">{error}</p>
              )}

              {success && (
                <p className="text-green-500 mt-4">{success}</p>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}