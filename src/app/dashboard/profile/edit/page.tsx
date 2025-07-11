
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  github: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
    const { toast } = useToast();

    // In a real app, you would fetch the user's current data
    const defaultValues: Partial<ProfileFormValues> = {
        name: 'Alex Johnson',
        username: 'currentuser',
        bio: 'Full-stack developer with a passion for building scalable and maintainable applications. Currently exploring the world of Go and Rust.',
        github: 'https://github.com/alexjohnson',
        twitter: 'https://twitter.com/alexjohnson',
        linkedin: 'https://linkedin.com/in/alexjohnson',
    };

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onChange",
    });

    const onSubmit = (data: ProfileFormValues) => {
        console.log(data);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
        // Here you would call your backend to save the data
    };
    
    return (
        <div className="container mx-auto max-w-2xl py-6 sm:py-8 animate-fade-in-up">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Edit Profile</CardTitle>
                    <CardDescription>Update your public profile information here.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="user avatar" />
                                    <AvatarFallback>AJ</AvatarFallback>
                                </Avatar>
                                <Button type="button" variant="outline">Change Avatar</Button>
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your_username" {...field} />
                                        </FormControl>
                                        <FormDescription>This is your public display name. It can only contain lowercase letters, numbers, and underscores.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Tell us a little about yourself" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div>
                                <h3 className="text-lg font-medium font-headline">Social Links</h3>
                                <div className="space-y-4 mt-4">
                                     <FormField
                                        control={form.control}
                                        name="github"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GitHub</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://github.com/your_username" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="twitter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>X / Twitter</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://x.com/your_username" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="linkedin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>LinkedIn</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://linkedin.com/in/your_username" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                             </div>

                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                               {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
