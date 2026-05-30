'use client'

import { useEffect } from 'react'
import { trackEvent, GAEvent } from '@/src/utils/analytics'

export default function AnalyticsTracker({ action, category, label, value }: GAEvent) {
  useEffect(() => {
    trackEvent({ action, category, label, value })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array ensures we only fire this once when the component mounts

  return null
}
