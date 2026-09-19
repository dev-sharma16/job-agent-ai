import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/job-tracker/",
        "/resume-builder/",
        "/practice-interview/",
        "/linkedin-optimizer/",
        "/account/",
        "/feedback/",
        "/login",
        "/signup",
        "/reset-password",
        "/_next/",
        "/static/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}