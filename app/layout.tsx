import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "INFORM — Self-Service Student Information Kiosk",
  description:
    "Access your academic records, enrollment, grades, and more — anytime, anywhere on campus.",
  icons: {
    icon: "/cfei-logo.jpg",
    shortcut: "/cfei-logo.jpg",
    apple: "/cfei-logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning className="app-shell">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
