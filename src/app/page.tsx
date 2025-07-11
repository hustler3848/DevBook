
"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { SplashScreen } from '@/components/splash-screen';

const initialSnippets = [
  {
    id: 1,
    language: 'jsx',
    filename: 'use-debounce-hook.tsx',
    stars: '2.1k',
    tags: ['React', 'Hooks'],
    code: `
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`.trim(),
  },
  {
    id: 2,
    language: 'python',
    filename: 'simple_web_scraper.py',
    stars: '1.8k',
    tags: ['Python', 'Scraping'],
    code: `
import requests
from bs4 import BeautifulSoup

def scrape_title(url):
    try:
        response = requests.get(url)
        response.raise_for_status() 

        soup = BeautifulSoup(response.text, 'html.parser')
        return soup.title.string

    except requests.exceptions.RequestException as e:
        return f"Error: {e}"

# Example usage
print(scrape_title("http://example.com"))`.trim(),
  },
  {
    id: 3,
    language: 'css',
    filename: 'glassmorphism.css',
    stars: '3.2k',
    tags: ['CSS', 'UI'],
    code: `
.glassmorphic {
  /* Background */
  background: rgba(255, 255, 255, 0.2);
  
  /* Backdrop Filter */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Border */
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);

  /* Shadow for depth */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`.trim(),
  },
];


const CodeCard = ({ snippet, isAnimating }: { snippet: any; isAnimating: boolean }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
  const cardBg = theme === 'dark' ? 'bg-black/70' : 'bg-white/70';

  if (!mounted) {
    return (
      <div className={cn("glassmorphic rounded-xl p-4 shadow-lg w-full max-w-xl mx-auto")}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-code">{snippet.filename}</p>
        </div>
        <div className="rounded-lg bg-muted animate-pulse h-[200px]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glassmorphic rounded-xl p-4 shadow-lg w-full max-w-xl mx-auto cursor-pointer",
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-muted-foreground font-code">{snippet.filename}</p>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className={cn("rounded-lg overflow-hidden text-sm", cardBg)}>
        <SyntaxHighlighter
          language={snippet.language}
          style={syntaxTheme}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          className="custom-scrollbar"
          codeTagProps={{className: "font-code"}}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span>{snippet.stars}</span>
          </div>
          <span>•</span>
          <span>{snippet.tags[0]}</span>
          <span>•</span>
          <span>{snippet.tags[1]}</span>
        </div>
        <span className='hidden sm:inline'>Updated 2 days ago</span>
      </div>
    </div>
  );
};
export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Splash screen duration

    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 1600); // Start animations after splash screen

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  const cycleCard = (clickedIndex: number) => {
    setActiveIndex(clickedIndex);
  };
  
  const getCardStyle = (index: number) => {
    if (!isAnimating) {
      return { transform: 'rotate(0deg) scale(0.95)', opacity: 0, zIndex: 0 };
    }
    const offset = (index - activeIndex + initialSnippets.length) % initialSnippets.length;
    
    if (isSmallScreen) {
      const initialRotation = -5;
      const rotationStep = -8;
      const yOffsetStep = 10;

      const yOffset = offset * yOffsetStep;
      const rotation = initialRotation + (offset * rotationStep);
      const zIndex = initialSnippets.length - offset;
      
      if (offset < 3) {
        return {
          transform: `translateY(${yOffset}px) rotate(${rotation}deg)`,
          opacity: 1,
          zIndex: zIndex,
        };
      }
      return { transform: `translateY(${3 * yOffsetStep}px) rotate(${initialRotation + 3 * rotationStep}deg)`, opacity: 0, zIndex: 0 };

    }

    if (offset === 0) {
      return { transform: 'rotate(0deg) translateX(0) translateY(-20px) scale(1)', opacity: 1, zIndex: 3 };
    }
    if (offset === 1) { // Card to the right
      return { transform: 'rotate(5deg) translateX(150px) translateY(-10px) scale(0.95)', opacity: 0.7, zIndex: 2 };
    }
    if (offset === 2) { // Card to the left
       return { transform: 'rotate(-5deg) translateX(-150px) translateY(-10px) scale(0.95)', opacity: 0.7, zIndex: 1 };
    }
    
    return { transform: 'scale(0.8)', opacity: 0, zIndex: 0 };
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="relative isolate overflow-hidden w-full">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-gradient-from to-gradient-to opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="container mx-auto px-6 lg:px-8 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10">
            <div className={cn(
                "mx-auto max-w-2xl lg:mx-0 lg:flex-auto text-center lg:text-left mb-32 lg:mb-0 transition-opacity duration-1000",
                isAnimating ? 'opacity-100' : 'opacity-0'
              )}>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Share, Discover, and Innovate with CodeSnippr
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                The ultimate platform for developers to manage and share reusable code snippets. Boost your productivity and collaborate with a global community of coders.
              </p>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
                <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity shadow-lg">
                  <Link href="/signup">
                    Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="link" size="lg" className="hidden sm:flex">
                  <Link href="/dashboard">
                    Explore Snippets <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow w-full lg:w-1/2">
              <div className="relative h-[400px] w-full max-w-xl mx-auto flex items-center justify-center lg:justify-start">
                {initialSnippets.map((snippet, index) => {
                   const style = getCardStyle(index);
                   return (
                     <div
                       key={snippet.id}
                       className="absolute w-full h-full transition-all duration-700 ease-in-out origin-bottom-left"
                       style={style}
                       onClick={() => cycleCard(index)}
                     >
                       <CodeCard snippet={snippet} isAnimating={isAnimating} />
                     </div>
                   );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
