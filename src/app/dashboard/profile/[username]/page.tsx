
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin, Twitter, Edit, Code, Star, Bookmark } from 'lucide-react';
import DashboardClientPage from '../../dashboard-client-page';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import type { Snippet } from '@/types/snippet';
import { getPublicSnippetsForUser, getSavedSnippets, getStarredSnippets, findUserByUsername, updateUserProfile as updateUserProfileInDb } from '@/lib/firebase/firestore';
import ProfileLoading from './loading';
import { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const params = useParams();
    const { toast } = useToast();
    const { user: currentUser, loading: authLoading } = useAuth();
    const username = params.username as string;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isOwnProfile = currentUser?.uid === profileUser?.uid;

    const fetchProfileData = useCallback(async () => {
        if (!username) return;
        setIsLoading(true);
        
        try {
            const foundUser = await findUserByUsername(username);

            if (foundUser) {
                setProfileUser(foundUser); // Set user early to determine isOwnProfile
                
                const viewingOwnProfile = currentUser?.uid === foundUser.uid;

                const publicSnippets = await getPublicSnippetsForUser(foundUser.uid);
                let savedSnippets: Snippet[] = [];
                let starredSnippets: Snippet[] = [];

                if (viewingOwnProfile) {
                    [savedSnippets, starredSnippets] = await Promise.all([
                        getSavedSnippets(foundUser.uid),
                        getStarredSnippets(foundUser.uid)
                    ]);
                }
                
                setProfileUser({
                    ...foundUser,
                    stats: {
                        created: publicSnippets.length,
                        saved: savedSnippets.length,
                        starred: starredSnippets.length,
                    }
                });
                setUserSnippets(publicSnippets);
            } else {
                setProfileUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch profile data", error);
            setProfileUser(null);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username, currentUser?.uid]);

    useEffect(() => {
        if (!authLoading) {
            fetchProfileData();
        }
    }, [username, authLoading, fetchProfileData]);

    const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
        if (profileUser && currentUser) {
            try {
                await updateUserProfileInDb(currentUser.uid, updatedProfile);
                setProfileUser(prev => prev ? { ...prev, ...updatedProfile } : null);
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been successfully updated.",
                });
                setIsEditDialogOpen(false);

                // If username changed, we might need to redirect, but for now we just update state
                if (updatedProfile.username && updatedProfile.username !== username) {
                    // router.push(`/dashboard/profile/${updatedProfile.username}`);
                    // For simplicity, we'll just refetch data for the new username state
                    fetchProfileData();
                }

            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: error.message || "Could not update profile.",
                });
            }
        }
    }


    if (isLoading) {
        return <ProfileLoading />;
    }

    if (!profileUser) {
        return notFound();
    }

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
                                    <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                                    <AvatarFallback>{profileUser.name?.charAt(0)}</AvatarFallback>
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
                                    {profileUser.social?.github && <a href={profileUser.social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github /></a>}
                                    {profileUser.social?.twitter && <a href={profileUser.social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter /></a>}
                                    {profileUser.social?.linkedin && <a href={profileUser.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>}
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
                                    <Code className="mr-2 h-4 w-4" /> Public Snippets
                                </span>
                                <span className="font-semibold">{profileUser.stats?.created ?? 0}</span>
                           </div>
                           {isOwnProfile && (
                             <>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-muted-foreground">
                                        <Star className="mr-2 h-4 w-4" /> Snippets Starred
                                    </span>
                                    <span className="font-semibold">{profileUser.stats?.starred ?? 0}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                    <span className="flex items-center text-muted-foreground">
                                        <Bookmark className="mr-2 h-4 w-4" /> Snippets Saved
                                    </span>
                                    <span className="font-semibold">{profileUser.stats?.saved ?? 0}</span>
                               </div>
                             </>
                           )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Public Snippets */}
                <div className="lg:col-span-2">
                   <DashboardClientPage snippets={userSnippets} title="Public Snippets" collectionType="public-profile"/>
                </div>
            </div>
        </div>
        {isOwnProfile && profileUser && (
            <EditProfileDialog 
                isOpen={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
                currentUserProfile={profileUser}
                onProfileUpdate={handleProfileUpdate}
            />
        )}
        </>
    )
}
