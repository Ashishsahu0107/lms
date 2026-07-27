// app/layout.tsx — Root layout with Global 3D Three.js Background
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import GlobalThreeBackground from "@/components/ui/GlobalThreeBackground";

export const metadata: Metadata = {
  title: {
    default: "LMS Pro — Learning Management System",
    template: "%s | LMS Pro",
  },
  description:
    "Enterprise-grade Learning Management System with AI tutor, real-time messaging, gamification, and comprehensive analytics.",
  keywords: ["LMS", "e-learning", "online courses", "education", "AI tutor"],
  authors: [{ name: "LMS Pro Team" }],
  openGraph: {
    type: "website",
    siteName: "LMS Pro",
    title: "LMS Pro — Learning Management System",
    description: "Enterprise-grade LMS with AI, real-time features, and gamification",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="relative">
        <AppProviders>
          <GlobalThreeBackground />
          <div className="relative z-10">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
