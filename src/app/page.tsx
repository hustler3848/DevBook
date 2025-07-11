import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="relative isolate overflow-hidden">
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

          <div className="container mx-auto px-6 lg:px-8 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto animate-fade-in-up">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Share, Discover, and Innovate with CodeSnippr
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                The ultimate platform for developers to manage and share reusable code snippets. Boost your productivity and collaborate with a global community of coders.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity shadow-lg">
                  <Link href="/signup">
                    Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="link" size="lg">
                    <Link href="/dashboard">
                        Explore Snippets <span aria-hidden="true">→</span>
                    </Link>
                </Button>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow animate-fade-in-up [animation-delay:200ms]">
              <div className="glassmorphic rounded-xl p-4 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground font-code">/components/react-hook.tsx</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <pre className="rounded-lg bg-black/70 p-4 overflow-x-auto">
                  <code className="font-code text-sm text-white">
                    <span className="text-purple-400">import</span> {'{'} <span className="text-blue-400">useState</span>, <span className="text-blue-400">useEffect</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">{` 'react'`}</span>;
                    <br /><br />
                    <span className="text-purple-400">function</span> <span className="text-yellow-300">useWindowSize</span>() {'{'}
                    <br />
                    {'  '}<span className="text-purple-400">const</span> [size, setSize] = <span className="text-blue-400">useState</span>([0, 0]);
                    <br />
                    {'  '}<span className="text-blue-400">useEffect</span>{'(() => {'}
                    <br />
                    {'    '}<span className="text-purple-400">function</span> <span className="text-yellow-300">updateSize</span>() {'{'}
                    <br />
                    {'      '}setSize([<span className="text-blue-400">window</span>.innerWidth, <span className="text-blue-400">window</span>.innerHeight]);
                    <br />
                    {'    '}{'}'}
                    <br />
                    {'    '}window.addEventListener(<span className="text-green-400">{`'resize'`}</span>, updateSize);
                    <br />
                    {'    '}updateSize();
                    <br />
                    {'    '}<span className="text-purple-400">return</span> {'() =>'} window.removeEventListener(<span className="text-green-400">{`'resize'`}</span>, updateSize);
                    <br />
                    {'  '}{'}, []);
                    <br />
                    {'  '}<span className="text-purple-400">return</span> size;
                    <br />
                    {'}'}
                  </code>
                </pre>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400"/>
                            <span>1.2k</span>
                        </div>
                        <span>•</span>
                        <span>React</span>
                        <span>•</span>
                        <span>Hooks</span>
                    </div>
                    <span>Updated 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
