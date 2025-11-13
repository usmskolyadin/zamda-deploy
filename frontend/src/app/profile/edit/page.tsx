'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { API_URL } from "@/src/shared/api/base";

export default function ProfileEdit() {
  const { accessToken, user, login, updateUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    city: "",
    avatar: null as File | null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          city: data.profile?.city || "",
          avatar: null,
        });
        setAvatarPreview(data.profile?.avatar || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        const body = new FormData();
        body.append("first_name", formData.first_name);
        body.append("last_name", formData.last_name);
        body.append("email", formData.email);
        body.append("city", formData.city);
        if (formData.avatar) body.append("avatar", formData.avatar);

        const res = await fetch(`${API_URL}/api/users/me/`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body,
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.detail || "Something went wrong");
        return;
        }

        const refreshed = await fetch(`${API_URL}/api/users/me/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        });
        const newUserData = await refreshed.json();

        updateUser(newUserData);
        
        setSuccess("Profile updated successfully!");

        router.push("/listings");
    } catch (err) {
        setError("Network error. Please try again later.");
    }
    };


  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="mx-auto text-black font-bold text-4xl py-4 text-center">
            Edit your profile
          </h1>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="flex-col items-center mx-auto mt-4 mb-4 lg:mt-0 lg:mb-0 w-full max-w-md">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="flex">
                <input
                  className="p-4 border text-gray-900 border-black rounded-3xl h-[44px] w-1/2 mr-2 mt-2"
                  placeholder="First name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="p-4 border text-gray-900 border-black rounded-3xl h-[44px] w-1/2 mt-2"
                  placeholder="Last name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                className="p-4 border text-gray-900 border-black rounded-3xl h-[44px] w-full mt-2"
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className="p-4 border text-gray-900 border-black rounded-3xl h-[44px] w-full mt-2"
                placeholder="City"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <div className="mt-2">
                <label className="block mb-1 text-black">Avatar</label>
                <input className="p-4 border text-gray-900 border-black rounded-3xl h-[55px] w-full " type="file" name="avatar" onChange={handleChange} />
                {avatarPreview && (
                    <>
                        <div className="flex flex-col items-center justify-center py-2">
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="mt-2 w-24 h-24 object-cover rounded-full text-center"
                            />
                        </div>
                        <h1 className="text-black text-lg font-medium text-center">Your avatar will look like this ↑</h1>
                    </>
                )}
              </div>

              {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
              {success && <p className="text-green-500 mt-2 text-center">{success}</p>}

              <button
                type="submit"
                className="mt-4 bg-black w-[120px] mx-auto h-[44px] rounded-3xl flex justify-center items-center text-white"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
function updateUser(newUserData: any) {
  throw new Error("Function not implemented.");
}

