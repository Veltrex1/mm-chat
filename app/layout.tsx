import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarriedMore | Let's Get Started",
  description: "Answer a few questions to get your personalized calculator experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

