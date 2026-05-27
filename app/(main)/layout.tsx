import NavigationBar from '@/components/common/NavigationBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh gradient-bg flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <NavigationBar />
    </div>
  )
}
