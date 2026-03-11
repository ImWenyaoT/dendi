import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A simple Next.js task manager with local persistence.',
}

/**
 * Provides the shared HTML shell for the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
