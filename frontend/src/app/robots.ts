import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/chats",
          "/messages",
          "/notifications",
        ],
      },
    ],
    sitemap: "https://zamda.com/sitemap.xml",
  };
}
