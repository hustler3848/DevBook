
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { UserProfile } from '@/types/user';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-z0-9_.-]+$/, "Username can only contain lowercase letters, numbers, underscores, periods, and hyphens."),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  github: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  avatar: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    currentUserProfile: UserProfile;
    onProfileUpdate: (updatedProfile: Partial<UserProfile>) => Promise<void>;
}

export function EditProfileDialog({ isOpen, onOpenChange, currentUserProfile, onProfileUpdate }: EditProfileDialogProps) {
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUserProfile.name || '',
            username: currentUserProfile.username || '',
            bio: currentUserProfile.bio || '',
            github: currentUserProfile.social?.github || '',
            twitter: currentUserProfile.social?.twitter || '',
            linkedin: currentUserProfile.social?.linkedin || '',
            avatar: currentUserProfile.avatar || '',
        },
        mode: "onChange",
    });

    const onSubmit = async (data: ProfileFormValues) => {
        await onProfileUpdate({
            name: data.name,
            username: data.username,
            bio: data.bio,
            avatar: data.avatar,
            social: {
                github: data.github,
                twitter: data.twitter,
                linkedin: data.linkedin,
            }
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="font-headline text-2xl">Edit Profile</DialogTitle>
                    <DialogDescription>Update your public profile information here.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow">
                    <div className="px-6 pb-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={form.watch('avatar') || "https://placehold.co/128x128.png"} />
                                        <AvatarFallback>{form.watch('name')?.substring(0,2) || 'U'}</AvatarFallback>
                                    </Avatar>
                                     <FormField
                                        control={form.control}
                                        name="avatar"
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel>Avatar URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                            <FormDescription>This is your public display name. Must be unique.</FormDescription>
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
                                    <h3 className="text-md font-medium font-headline mb-4">Social Links</h3>
                                    <div className="space-y-4">
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
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
                <DialogFooter className="p-6 pt-4 border-t">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
