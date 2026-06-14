import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sportora | Countdown to Greatness",
  description: "Real-time sports countdown and live event tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body className="h-full bg-black text-white antialiased selection:bg-blue-600 selection:text-white">
        <div className="flex flex-col min-h-screen">
          <main className="grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
