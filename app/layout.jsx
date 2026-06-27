import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE),
  title: "AskTheCrowd — see what the internet is asking",
  description: "Free, open-source keyword question explorer. Type a keyword, see the questions, prepositions and comparisons people search for.",
  openGraph: { images: ["/api/og"] },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
