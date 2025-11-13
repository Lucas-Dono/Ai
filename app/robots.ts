import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/community", "/login", "/register"],
        disallow: [
          "/dashboard",
          "/api/*",
          "/admin/*",
          "/_next/*",
          "/configuracion/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/pricing", "/community", "/community/marketplace/*"],
        disallow: ["/dashboard", "/api/*", "/admin/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
