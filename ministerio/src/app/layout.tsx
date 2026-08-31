import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "Ministerio de Adolescentes",
  description: "Gestion del ministerio de adolescentes: calendario, tareas, directorio y avisos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Adolescentes",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
