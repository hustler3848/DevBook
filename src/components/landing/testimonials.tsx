
"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Autoplay from "embla-carousel-autoplay"

const testimonialData = [
  {
    name: "Sarah D.",
    handle: "@sarahdev",
    avatar: "https://placehold.co/48x48.png",
    dataAiHint: "female developer",
    quote: "CodeSnippr has revolutionized how I manage my reusable components. The AI features are a game-changer!"
  },
  {
    name: "Alex J.",
    handle: "@alex_codes",
    avatar: "https://placehold.co/48x48.png",
    dataAiHint: "male programmer",
    quote: "Found the perfect snippet in seconds! The community and sharing aspect is fantastic for collaboration."
  },
  {
    name: "Maria G.",
    handle: "@mariacodes",
    avatar: "https://placehold.co/48x48.png",
    dataAiHint: "latina developer",
    quote: "As a student, this is an invaluable tool for learning and keeping my code organized. Highly recommended!"
  },
    {
    name: "Chen W.",
    handle: "@chenwei",
    avatar: "https://placehold.co/48x48.png",
    dataAiHint: "asian developer",
    quote: "The ability to organize snippets into folders and the clean UI makes this my go-to tool daily."
  },
  {
    name: "Mike R.",
    handle: "@miker",
    avatar: "https://placehold.co/48x48.png",
    dataAiHint: "man developer",
    quote: "The AI-powered code review helped me catch a bug before it went to production. Incredible!"
  },
]

export function Testimonials() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-primary">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Loved by Developers Worldwide
          </p>
        </div>
        <div className="mt-16 flow-root">
            <Carousel 
                opts={{ align: "start", loop: true }} 
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full"
            >
            <CarouselContent className="-ml-4">
                {testimonialData.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                        <Card className="h-full glassmorphic">
                            <CardContent className="p-6 flex flex-col items-start gap-4">
                                <p className="text-muted-foreground flex-grow">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden sm:block">
                <CarouselPrevious />
                <CarouselNext />
            </div>
            </Carousel>
        </div>
      </div>
    </section>
  )
}
