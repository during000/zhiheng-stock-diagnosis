import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知衡 · 个股证据诊断",
  description: "贵州茅台多维研究，区分事实、推断与未知，追溯每条证据。",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
