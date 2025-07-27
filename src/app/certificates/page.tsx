'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import CertificateManager from '@/components/CertificateManager'
import { Certificate } from '@/types/quiz'
import { loadCertificatesFromStorage } from '@/lib/storage'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    setCertificates(loadCertificatesFromStorage())
  }, [])

  const handleCertificatesUpdate = () => {
    setCertificates(loadCertificatesFromStorage())
  }

  return (
    <AppLayout activeTab="certificates" onTabChange={() => {}}>
      <div className="animate-in fade-in duration-500">
        <CertificateManager 
          certificates={certificates}
          onUpdate={handleCertificatesUpdate}
        />
      </div>
    </AppLayout>
  )
}