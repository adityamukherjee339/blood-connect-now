import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "Blood Connect",
  description: "Connecting blood donors with those in need.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
