
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSnippet } from '@/ai/flows/analyze-snippet';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { addSnippet } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';

const snippetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  codeSnippet: z.string().min(10, 'Code snippet must be at least 10 characters long.'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag.'),
  language: z.string().min(1, 'Please specify the language.'),
  isPublic: z.boolean().default(false),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

export function NewSnippetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGeneratedTags, setAiGeneratedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      description: '',
      codeSnippet: '',
      tags: [],
      language: '',
      isPublic: false,
    },
  });

  const codeSnippetValue = form.watch('codeSnippet');
  const debouncedCodeSnippet = useDebounce(codeSnippetValue, 1000);
  const currentTags = form.watch('tags');
  
  useEffect(() => {
    const handleAnalyzeSnippet = async (code: string) => {
      if (!code || code.length < 50) return;
      setIsAnalyzing(true);
      try {
        const result = await analyzeSnippet({ codeSnippet: code });
        
        // Only set values if they are not already set by the user, to avoid overriding manual input.
        if (!form.getValues('title')) {
          form.setValue('title', result.title, { shouldValidate: true });
        }
        if (!form.getValues('description')) {
          form.setValue('description', result.description, { shouldValidate: true });
        }

        const manualTags = form.getValues('tags').filter(tag => !aiGeneratedTags.includes(tag));
        const newTags = Array.from(new Set([...manualTags, ...result.tags]));
        form.setValue('tags', newTags, { shouldValidate: true });
        setAiGeneratedTags(result.tags);

        if (!form.getValues('language')) {
          form.setValue('language', result.language, { shouldValidate: true });
        }

      } catch (error) {
        console.error('Error analyzing snippet:', error);
        toast({
          variant: 'destructive',
          title: 'AI Analysis Failed',
          description: 'Could not analyze snippet. Please check your connection or try again later.',
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    if (debouncedCodeSnippet) {
      handleAnalyzeSnippet(debouncedCodeSnippet);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCodeSnippet]);

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: SnippetFormValues) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Authenticated',
            description: 'You must be logged in to create a snippet.',
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const userDetails = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
      await addSnippet(userDetails, data);
      toast({
        title: "Snippet Created!",
        description: "Your new snippet has been successfully saved.",
      });
      form.reset();
      setAiGeneratedTags([]);
      router.push('/dashboard/my-snippets');
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create snippet. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isSubmitting || isAnalyzing;

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
        
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Public Snippet
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                    Allow other users to discover and view this snippet.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isProcessing} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : isAnalyzing ? 'Analyzing...' : 'Create Snippet'}
        </Button>
      </form>
    </Form>
  );
}
