'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Sparkles, BookOpen } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: 'generate' | 'browse' | 'test'
  onTabChange: (tab: 'generate' | 'browse' | 'test') => void
  quizCount?: number
}

export default function AppLayout({ children, quizCount = 0 }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      id: 'generate' as const,
      label: 'Start Quiz',
      icon: Sparkles,
      href: '/create'
    },
    {
      id: 'browse' as const,
      label: 'My Quizzes',
      icon: BookOpen,
      badge: quizCount > 0 ? quizCount : undefined,
      href: '/browse'
    }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="app-container">
      {/* App Header with Navigation */}
      <header className="app-header h-20 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-button-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-slate-700">
              Quiz
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                Craft
              </span>
            </h1>
            <p className="text-xs text-slate-500">AI-powered certification prep</p>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center space-x-2 bg-white/30 rounded-2xl p-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                pathname === item.href
                  ? 'bg-gradient-button-primary text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-white/40'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.badge && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

      </header>

      {/* Main Content */}
      <main className="w-full">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}