import type { MetadataRoute } from "next";

// docs/DBD.md section 6.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fixmaster",
    short_name: "Fixmaster",
    description:
      "Manajemen servis untuk toko reparasi laptop, HP, dan perangkat elektronik.",
    lang: "id",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#111419",
    theme_color: "#111419",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
