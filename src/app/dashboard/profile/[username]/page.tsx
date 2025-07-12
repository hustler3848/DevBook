
"use client"

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin, Twitter, Edit, Code, Star, Bookmark } from 'lucide-react';
import DashboardClientPage from '../../dashboard-client-page';
import { notFound } from 'next/navigation';
import { EditProfileDialog } from '@/components/edit-profile-dialog';

// Mock data - in a real app, this would be fetched from a database
const users = {
    'elenapetrova': {
        name: 'Elena Petrova',
        username: 'elenapetrova',
        avatar: 'https://placehold.co/128x128.png',
        dataAiHint: 'woman developer',
        bio: 'Frontend Developer & UI/UX enthusiast. Turning complex problems into beautiful, intuitive designs. Lover of all things React and CSS.',
        social: {
            github: 'https://github.com/elenapetrova',
            twitter: 'https://twitter.com/elenapetrova',
            linkedin: 'https://linkedin.com/in/elenapetrova',
        },
        stats: {
            created: 15,
            starred: 52,
            saved: 34,
        },
        publicSnippets: [
             { id: 1, title: 'Custom Framer Motion Animation', description: 'A reusable animation variant for stunning enter effects.', tags: ['framer-motion', 'react', 'animation'], language: 'TypeScript' },
             { id: 3, title: 'Tailwind CSS Plugin', description: 'A simple plugin to add custom utilities for text shadows.', tags: ['tailwindcss', 'css', 'plugin'], language: 'JavaScript' },
        ]
    },
     'currentuser': {
        name: 'Alex Johnson',
        username: 'currentuser',
        avatar: 'https://placehold.co/128x128.png',
        dataAiHint: 'user avatar',
        bio: 'Full-stack developer with a passion for building scalable and maintainable applications. Currently exploring the world of Go and Rust.',
        social: {
            github: 'https://github.com/alexjohnson',
            twitter: 'https://twitter.com/alexjohnson',
            linkedin: 'https://linkedin.com/in/alexjohnson',
        },
        stats: {
            created: 8,
            starred: 21,
            saved: 12,
        },
        publicSnippets: [
             { id: 5, title: 'Async/Await Error Handling', description: 'A wrapper for cleaner async error handling.', tags: ['javascript', 'async', 'error-handling'], language: 'JavaScript' },
             { id: 6, title: 'Docker Compose for MERN', description: 'A docker-compose file for MERN stack.', tags: ['docker', 'mern', 'devops'], language: 'YAML' },
        ]
    }
}

type UserProfile = typeof users.elenapetrova;


export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const username = params.username as keyof typeof users;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    // In a real app, you would fetch user data here based on the username param
    // For now, we use mock data
    const profileUser: UserProfile | undefined = users[username];

    if (!profileUser) {
        return notFound();
    }
    
    // A simple check to see if the logged-in user is viewing their own profile
    // In a real app, you'd compare user IDs
    const isOwnProfile = currentUser?.displayName?.toLowerCase().replace(' ','') === profileUser.username || (currentUser?.email && profileUser.username === 'currentuser');


    return (
        <>
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Info & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={profileUser.avatar} alt={profileUser.name} data-ai-hint={profileUser.dataAiHint} />
                                    <AvatarFallback>{profileUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold font-headline">{profileUser.name}</h1>
                                    <p className="text-muted-foreground">@{profileUser.username}</p>
                                </div>
                                <p className="text-center text-sm text-muted-foreground">{profileUser.bio}</p>

                                 {isOwnProfile && (
                                    <Button onClick={() => setIsEditDialogOpen(true)} className="w-full">
                                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                    </Button>
                                )}

                                <div className="flex space-x-4 pt-2">
                                    <a href={profileUser.social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github /></a>
                                    <a href={profileUser.social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter /></a>
                                    <a href={profileUser.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="flex items-center justify-between">
                                <span className="flex items-center text-muted-foreground">
                                    <Code className="mr-2 h-4 w-4" /> Snippets Created
                                </span>
                                <span className="font-semibold">{profileUser.stats.created}</span>
                           </div>
                           <div className="flex items-center justify-between">
                                <span className="flex items-center text-muted-foreground">
                                    <Star className="mr-2 h-4 w-4" /> Snippets Starred
                                </span>
                                <span className="font-semibold">{profileUser.stats.starred}</span>
                           </div>
                           <div className="flex items-center justify-between">
                                <span className="flex items-center text-muted-foreground">
                                    <Bookmark className="mr-2 h-4 w-4" /> Snippets Saved
                                </span>
                                <span className="font-semibold">{profileUser.stats.saved}</span>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Public Snippets */}
                <div className="lg:col-span-2">
                   <h2 className="text-2xl font-bold font-headline mb-6">Public Snippets</h2>
                   <DashboardClientPage snippets={profileUser.publicSnippets} />
                </div>
            </div>
        </div>
        {isOwnProfile && (
            <EditProfileDialog 
                isOpen={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
            />
        )}
        </>
    )
}
