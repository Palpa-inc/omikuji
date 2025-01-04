import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/providers/FirebaseProvider";
import Wave from "react-wavify";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "おみログ",
  description: "おみくじの運勢を記録して後から振り返ろう",
  openGraph: {
    title: "おみログ",
    description: "おみくじの運勢を記録して後から振り返ろう",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "おみログ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "おみログ",
    description: "おみくじの運勢を記録して後から振り返ろう",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <FirebaseProvider>{children}</FirebaseProvider>
        <div className="fixed bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none -z-50">
          <Wave
            fill="rgb(137 91 190 / 0.4)"
            paused={false}
            options={{
              height: 20,
              amplitude: 30,
              speed: 0.15,
              points: 4,
            }}
          />
        </div>
      </body>
    </html>
  );
}
