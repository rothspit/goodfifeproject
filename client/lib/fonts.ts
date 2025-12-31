import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';

export const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans'
});

export const notoSerifJP = Noto_Serif_JP({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '900'],
  variable: '--font-noto-serif'
});
