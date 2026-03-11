import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider/theme-provider'

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
    <html lang='en' data-theme='cloud-dancer' data-color-scheme='light' suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
