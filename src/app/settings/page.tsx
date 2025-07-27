'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import SettingsForm from '@/components/SettingsForm'
import { AppSettings } from '@/types/quiz'
import { loadSettingsFromStorage } from '@/lib/storage'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({ apiKey: '', language: 'en' })

  useEffect(() => {
    setSettings(loadSettingsFromStorage())
  }, [])

  const handleSettingsUpdate = () => {
    setSettings(loadSettingsFromStorage())
  }

  return (
    <AppLayout activeTab="settings" onTabChange={() => {}}>
      <div className="animate-in fade-in duration-500">
        <SettingsForm 
          settings={settings}
          onUpdate={handleSettingsUpdate}
        />
      </div>
    </AppLayout>
  )
}