'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { sendGAEvent } from '@next/third-parties/google'

export default function TelemetryHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized_admin') {
      sendGAEvent({ event: 'unauthorized_admin_access' })
      
      // Clean up the URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('error')
      const newUrl = `${pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, pathname])

  return null
}
