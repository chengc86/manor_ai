import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manor Quest | The Manor Preparatory School",
  description: "Answer Year 6 questions, earn coins, buy heroes and protect your shared Manor Prep class world together.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
