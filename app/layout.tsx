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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{function clean(){var el=document.querySelectorAll("[bis_skin_checked],[bis_click],[bis_element],[bis_significant-attr]");for(var i=0;i<el.length;i++){var attrs=el[i].attributes;for(var j=attrs.length-1;j>=0;j--){if(attrs[j].name.indexOf("bis_")===0){el[i].removeAttribute(attrs[j].name);}}}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",clean);}else{clean();}new MutationObserver(clean).observe(document.documentElement,{subtree:true,attributes:true,childList:true});}catch(e){}})();`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
