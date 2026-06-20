import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disponibilidad Total",
  description: "Dashboard de desempeño de ventas por tienda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
