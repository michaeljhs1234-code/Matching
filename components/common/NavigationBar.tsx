'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Swords, Trophy, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',    icon: Home,   label: '홈' },
  { href: '/sports',  icon: Swords, label: '스포츠' },
  { href: '/contest', icon: Trophy, label: '공모전' },
  { href: '/profile', icon: User,   label: '프로필' },
]

export default function NavigationBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav">
      <div className="glass border-t border-white/5 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]"
                style={{
                  color: isActive ? '#818cf8' : '#64748b',
                  background: isActive ? 'rgba(79,70,229,0.1)' : 'transparent',
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
