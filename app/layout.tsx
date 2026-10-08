import type { Metadata } from "next";
import "@/app/styles/global.css";

export const metadata: Metadata = {
  title: "거울아 거울아 — 황지영",
  description: "마법의 거울에게 황지영에 대해 물어보세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
