import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { spaceGrotesk, dmSans, firaCode } from './fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'CodeSnippr',
  description: 'A modern platform for developers to share and discover code snippets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased",
        spaceGrotesk.variable,
        dmSans.variable,
        firaCode.variable
      )}>
        <Providers attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
