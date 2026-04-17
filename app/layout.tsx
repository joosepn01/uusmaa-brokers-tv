import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uus Maa Nord · Top Brokers",
  description: "Office display leaderboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
