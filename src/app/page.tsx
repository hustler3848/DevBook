
"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const snippets = [
  {
    id: 1,
    language: 'React',
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
    language: 'Python',
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
    language: 'CSS',
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

const CodeCard = ({ snippet }: { snippet: any; }) => (
  <div
    className={cn(
      "glassmorphic rounded-xl p-4 shadow-lg w-full max-w-xl mx-auto cursor-pointer transition-all duration-300 ease-in-out",
    )}
  >
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm text-muted-foreground font-code">{snippet.filename}</p>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Copy className="h-4 w-4" />
      </Button>
    </div>
    <pre className="rounded-lg bg-black/70 p-4 overflow-x-auto">
      <code className="font-code text-sm text-white">
        {snippet.code}
      </code>
    </pre>
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

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

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
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto animate-fade-in-up text-center lg:text-left">
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
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow animate-fade-in-up [animation-delay:200ms] w-full lg:w-1/2">
              <div className="relative h-[400px] w-full max-w-xl mx-auto flex items-center justify-center">
                {snippets.map((snippet, index) => {
                  const offset = activeIndex - index;

                  return (
                    <div
                      key={snippet.id}
                      className="absolute w-full h-full transition-transform duration-500 ease-in-out origin-top-left"
                      style={{
                        transform: `rotate(${offset * -5 - 2}deg) translateX(${offset * -15}px) scale(${1 - Math.abs(offset) * 0.1})`,
                        zIndex: snippets.length - Math.abs(offset),
                        opacity: 1 - Math.abs(offset) * 0.3,
                      }}
                       onClick={() => setActiveIndex(index)}
                    >
                      <CodeCard
                        snippet={snippet}
                      />
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
