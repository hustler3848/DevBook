import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=DM+Sans:wght@400;600&family=Fira+Code&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
