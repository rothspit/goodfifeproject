import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '人妻の蜜 CRM管理画面',
  description: '顧客管理・予約管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
