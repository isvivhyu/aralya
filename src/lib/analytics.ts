// Google Analytics 4 utility functions

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-2GH17661XCv';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const config: Record<string, string | number | boolean> = {
      event_category: category,
    };
    if (label !== undefined) {
      config.event_label = label;
    }
    if (value !== undefined) {
      config.value = value;
    }
    window.gtag('event', action, config);
  }
};

// Meta Pixel tracking functions
export const trackMetaPixelEvent = (
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Declare gtag and fbq functions for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
    dataLayer: Array<Record<string, unknown>>;
    fbq: (
      command: 'init' | 'track' | 'trackCustom',
      eventName: string,
      parameters?: Record<string, string | number | boolean>
    ) => void;
  }
}

