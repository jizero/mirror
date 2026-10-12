import type { Metadata } from "next";
import Script from "next/script";
import "@/app/styles/global.css";

export const metadata: Metadata = {
  title: "거울아 거울아 — 황지영",
  description: "마법의 거울에게 황지영에 대해 물어보세요.",
};

/** Google Analytics 4 측정 ID (G-XXXXXXX). 없으면 GA를 싣지 않습니다 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
