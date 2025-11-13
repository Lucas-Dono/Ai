"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, use } from 'react';
import { defaultLocale } from '@/i18n/config';

interface IntlProviderProps {
  children: ReactNode;
  messagesPromise: Promise<{
    locale: string;
    messages: any;
  }>;
}

/**
 * Client-side provider for next-intl that wraps the application
 * and provides translations context to all client components
 */
export function IntlProvider({ children, messagesPromise }: IntlProviderProps) {
  // Use React's use() hook to unwrap the promise
  const { locale, messages } = use(messagesPromise);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="America/Buenos_Aires"
    >
      {children}
    </NextIntlClientProvider>
  );
}
