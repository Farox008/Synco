import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UIProvider } from '@/context/UIContext'
import { LayoutWrapper } from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Synco Software - Dashboard',
  description: 'Synco - Real-time factory intelligence platform',
}

import { AuthProvider } from '@/context/AuthContext'
import { DatabaseProvider } from '@/context/DatabaseContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <UIProvider>
          <AuthProvider>
            <DatabaseProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </DatabaseProvider>
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  )
}
