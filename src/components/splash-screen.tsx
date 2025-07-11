
"use client";

import { useEffect, useState } from 'react';
import { CodeXml } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 1500); // Starting exit animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-rose-500 transition-transform duration-[2000ms] ease-in-out',
        isExiting ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="flex items-center space-x-4 animate-fade-in-up">
        <CodeXml className="h-12 w-12 text-primary" />
        <span className="font-headline text-4xl font-bold">CodeSnippr</span>
      </div>
    </div>
  );
}
