
"use client"

import { useState, useEffect } from 'react';
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
import type { Snippet } from '@/types/snippet';
import { getUserSnippets, getPublicSnippets, getSavedSnippets, getStarredSnippets } from '@/lib/firebase/firestore';
import ProfileLoading from './loading';


export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser, loading: authLoading } = useAuth();
    const username = params.username as string;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    // In a real app, you would fetch user data here based on the username param
    const [profileUser, setProfileUser] = useState<any>(null);
    const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!username) return;
            setIsLoading(true);
            
            // This is a simplified lookup. In a real app, you'd query Firestore for a user by their username.
            // We'll simulate fetching based on the displayName.
            // For this example, we'll just check if we are viewing the current user's profile.
            
            if (currentUser && (currentUser.displayName?.toLowerCase().replace(' ', '') === username || (currentUser.email && username === 'currentuser'))) {
                 const [created, saved, starred, publicSnippets] = await Promise.all([
                    getUserSnippets(currentUser.uid),
                    getSavedSnippets(currentUser.uid),
                    getStarredSnippets(currentUser.uid),
                    getPublicSnippets(currentUser.uid)
                ]);

                setProfileUser({
                    name: currentUser.displayName,
                    username: username,
                    avatar: currentUser.photoURL || 'https://placehold.co/128x128.png',
                    dataAiHint: 'user avatar',
                    bio: 'Edit your bio by clicking the button above!', // Placeholder
                    social: {}, // Placeholder
                    stats: {
                        created: created.length,
                        saved: saved.length,
                        starred: starred.length,
                    }
                });
                setUserSnippets(publicSnippets);
            } else {
                // Here you would fetch another user's public profile data.
                // For now, we'll just show a not found state if it's not the current user.
                setProfileUser(null);
            }
            setIsLoading(false);
        }
        
        if (!authLoading) {
            fetchProfileData();
        }

    }, [username, currentUser, authLoading]);


    if (isLoading) {
        return <ProfileLoading />;
    }

    if (!profileUser) {
        return notFound();
    }
    
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
                   <DashboardClientPage snippets={userSnippets} title="Public Snippets" collectionType="public-profile"/>
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
