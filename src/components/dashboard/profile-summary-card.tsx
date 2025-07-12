
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Linkedin, Twitter, Edit } from 'lucide-react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';

interface ProfileSummaryCardProps {
    user: {
        name: string;
        username: string;
        avatar: string;
        dataAiHint: string;
        bio: string;
        social: {
            github: string;
            twitter: string;
            linkedin: string;
        }
    }
}

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    return (
        <>
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
                        <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">{user.bio}</p>

                    <Button onClick={() => setIsEditDialogOpen(true)} className="w-full">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>

                    <div className="flex space-x-4 pt-2">
                        <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github /></a>
                        <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter /></a>
                        <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
                    </div>
                </div>
            </CardContent>
        </Card>
        <EditProfileDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
        />
        </>
    );
}
