
"use client";

import Link from 'next/link';
import { CodeXml } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="container flex h-16 max-w-screen-2xl items-center glassmorphic rounded-b-lg">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 p-2">
            <CodeXml className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block text-foreground">
              CodeSnippr
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            { !loading && !user && !isAuthPage && (
              <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                    <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
             { !loading && user && (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

    