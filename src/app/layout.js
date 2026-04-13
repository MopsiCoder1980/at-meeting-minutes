import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import "./globals.css";

const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
});

const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
});

export async function generateMetadata() {
     const messages = await getMessages()
     return {
          title: messages?.app?.title ?? 'Meeting Minutes',
          description: messages?.app?.description ?? 'Meeting Minutes Verwaltung',
     }
}

export default async function RootLayout({ children }) {
     const locale = await getLocale()
     const messages = await getMessages()

     return (
          <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
               <body>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                         {children}
                    </NextIntlClientProvider>
               </body>
          </html>
     )
}
