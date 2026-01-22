import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import Script from "next/script";
import { ReduxProvider } from "./providers/redux-provider";

export const metadata: Metadata = {
  title: "Zamda — Buy & Sell Locally in the USA",
  description: "Zamda is a modern online marketplace for the USA. Buy and sell goods, find jobs, services, vehicles, and real estate in your city. Simple. Fast. Local. Everything will be ZAMDAmazing.",
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon.ico",
    apple: "/icons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VZ99K3MCQN"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VZ99K3MCQN');
          `}
        </Script>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head> 
      <body className="antialiased bg-white">
        <ReduxProvider>
          <ClientLayout>{children}</ClientLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
