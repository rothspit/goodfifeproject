import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: '人妻の蜜 | 西船橋 誠実で良い子が多いお店',
  description: '西船橋エリアの人妻専門店「人妻の蜜」。誠実で良い子が多く、30代〜80代の幅広い年齢層の方にご利用いただいております。',
  keywords: '人妻の蜜,西船橋,人妻,デリヘル',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}
