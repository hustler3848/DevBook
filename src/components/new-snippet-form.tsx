
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSnippet } from '@/ai/flows/analyze-snippet';
import { useDebounce } from '@/lib/hooks/use-debounce';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const snippetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  codeSnippet: z.string().min(10, 'Code snippet must be at least 10 characters long.'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag.'),
  language: z.string().optional(),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

export function NewSnippetForm() {
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGeneratedTags, setAiGeneratedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      description: '',
      codeSnippet: '',
      tags: [],
      language: '',
    },
  });

  const codeSnippetValue = form.watch('codeSnippet');
  const debouncedCodeSnippet = useDebounce(codeSnippetValue, 1000);
  const currentTags = form.watch('tags');
  
  useEffect(() => {
    if (debouncedCodeSnippet && debouncedCodeSnippet.length > 50) {
      handleAnalyzeSnippet(debouncedCodeSnippet);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCodeSnippet]);

  const handleAnalyzeSnippet = async (code: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSnippet({ codeSnippet: code });
      
      const newTitle = result.description.split('.').slice(0,1).join('');
      
      form.setValue('title', newTitle, { shouldValidate: true });
      form.setValue('description', result.description, { shouldValidate: true });

      // Filter out old AI-generated tags and combine with new ones
      const manualTags = currentTags.filter(tag => !aiGeneratedTags.includes(tag));
      const newTags = Array.from(new Set([...manualTags, ...result.tags]));
      form.setValue('tags', newTags, { shouldValidate: true });
      setAiGeneratedTags(result.tags); // Store the new set of AI tags

      form.setValue('language', result.language, { shouldValidate: true });

    } catch (error) {
      console.error('Error analyzing snippet:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not analyze snippet. Please try again later.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag]);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: SnippetFormValues) => {
    startTransition(() => {
      console.log(data);
      toast({
        title: "Snippet Created!",
        description: "Your new snippet has been saved.",
      });
      // Here you would typically send the data to your backend/Firebase
      form.reset();
      setAiGeneratedTags([]);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. React Debounce Hook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of what this snippet does." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codeSnippet"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Code Snippet</FormLabel>
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                    </div>
                )}
              </div>
              <FormControl>
                <Textarea
                  placeholder={`// Paste your code here\nfunction hello() {\n  console.log("Hello, world!");\n}`}
                  className="font-code min-h-[250px] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="tags"
            render={() => (
                <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                    <div className="flex flex-wrap gap-2 p-2 rounded-md border min-h-[40px] border-input">
                        {currentTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {tag}</span>
                            </button>
                        </Badge>
                        ))}
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. TypeScript" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" disabled={isPending || isAnalyzing} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Snippet
        </Button>
      </form>
    </Form>
  );
}
