import { sendGAEvent } from '@next/third-parties/google';

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export function trackEvent({ action, category, label, value }: GAEvent) {
  sendGAEvent('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}
