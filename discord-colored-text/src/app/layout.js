'use client';

import { MantineProvider } from '@mantine/core';
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#1a1b1e' }}>
        <MantineProvider defaultColorScheme="dark" >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
