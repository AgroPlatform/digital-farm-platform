import React from "react";
import "./globals.css";

// Simple root layout compatible with Vite + React.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Digital Farm Platform</title>
        <meta name="description" content="Modern agricultural management platform with FastAPI backend and Vite + React frontend" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
