import type { Metadata } from "next";
import "./globals.css";
import "./workbench.css";

export const metadata: Metadata = {
  title: "知衡 · AI 投资研究工作台",
  description: "从自然语言选股到个股诊断与事件证据，在同一工作台沿证据继续研究。",
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
