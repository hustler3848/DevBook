"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestTags } from '@/ai/flows/suggest-tags';
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
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

export function NewSnippetForm() {
  const [isPending, startTransition] = useTransition();
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      description: '',
      codeSnippet: '',
      tags: [],
    },
  });

  const codeSnippetValue = form.watch('codeSnippet');
  const debouncedCodeSnippet = useDebounce(codeSnippetValue, 1000);
  const currentTags = form.watch('tags');

  useEffect(() => {
    if (debouncedCodeSnippet && debouncedCodeSnippet.length > 50) {
      handleSuggestTags(debouncedCodeSnippet);
    } else {
      setSuggestedTags([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCodeSnippet]);

  const handleSuggestTags = async (code: string) => {
    setIsSuggesting(true);
    try {
      const result = await suggestTags({ codeSnippet: code });
      setSuggestedTags(result.tags.filter(tag => !currentTags.includes(tag)));
    } catch (error) {
      console.error('Error suggesting tags:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not suggest tags. Please try again later.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag]);
    }
  };
  
  const addSuggestedTag = (tag: string) => {
    addTag(tag);
    setSuggestedTags(suggestedTags.filter(t => t !== tag));
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
              <FormLabel>Description (Optional)</FormLabel>
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
              <FormLabel>Code Snippet</FormLabel>
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

        { (isSuggesting || suggestedTags.length > 0) && (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    { isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" /> }
                    <span>{isSuggesting ? 'Analyzing your code...' : 'Suggested Tags'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => (
                        <Button key={tag} type="button" size="sm" variant="outline" onClick={() => addSuggestedTag(tag)}>
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Snippet
        </Button>
      </form>
    </Form>
  );
}
