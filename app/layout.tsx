import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uus Maa Nord · Top Brokers",
  description: "Office display leaderboard",
};

// Read the persisted theme synchronously, before React paints, so the user
// never sees a flash of the dark theme when they've chosen light. Dark is
// the default; we only set data-theme="light" when needed.
const themeBootstrap = `
try {
  var t = localStorage.getItem("umnord-theme");
  if (t === "light") document.documentElement.dataset.theme = "light";
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
