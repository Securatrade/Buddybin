import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.buddybin.co.uk",
  ),
  title: {
    default: "BuddyBin | We sort it. You don't.",
    template: "%s | BuddyBin",
  },
  description:
    "BuddyBin organises recurring wheelie-bin cleaning through independent local cleaning partners.",
  openGraph: {
    title: "BuddyBin",
    description:
      "Choose your bins and collection schedule. BuddyBin organises a local cleaning partner and one simple monthly payment.",
    images: ["/buddybin-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-white text-[var(--color-body)] antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
