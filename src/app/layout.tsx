import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "@/components/sw-register";

export const metadata: Metadata = {
  title: "Bektash Ops",
  description:
    "Bektash operations platform — checklists, SOPs, audits, training and compliance. Rapos Hospitality Pvt Ltd.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Bektash Ops",
    statusBarStyle: "black-translucent",
  },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
