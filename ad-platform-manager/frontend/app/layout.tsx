import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '広告媒体一括更新システム',
  description: 'Mr.Venrey型 広告媒体一括配信管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
