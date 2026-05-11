import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "枕边故事 - 睡前小故事",
  description: "为TA讲述温馨有趣的睡前故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
