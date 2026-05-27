import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-pretendard',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CBNU Match — 충북대 스포츠·공모전 매칭',
    template: '%s | CBNU Match',
  },
  description: '충북대학교 재학생을 위한 스포츠 팀 매칭 및 공모전 팀원 모집 플랫폼. 전력 밸런싱 알고리즘으로 공정한 경기를 보장합니다.',
  keywords: ['충북대', '충북대학교', '스포츠 매칭', '공모전', '팀원 모집', '풋살', '농구', '축구'],
  authors: [{ name: 'CBNU Match Team' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: 'CBNU Match',
    description: '충북대학교 재학생 전용 스포츠·공모전 매칭 플랫폼',
    siteName: 'CBNU Match',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="min-h-dvh flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
