
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Snippet } from '@/types/snippet';
import type { Folder } from '@/types/folder';
import { Eye, Star, ChevronDown, ChevronUp, Bookmark, Trash2, MoreVertical, FolderPlus } from 'lucide-react';
import { getFolders, addSnippetToFolder } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export interface SnippetCardProps {
    snippet: Snippet;
    onSelect?: (snippet: Snippet) => void;
    onTagClick?: (tag: string) => void;
    onToggleStar?: (snippet: Snippet) => void;
    onToggleSave?: (snippet: Snippet) => void;
    onDelete?: (snippetId: string) => void;
    collectionType?: 'my-snippets' | 'saved' | 'starred' | 'explore' | 'public-profile';
}

export function SnippetCard({ 
    snippet, 
    onSelect, 
    onTagClick,
    onToggleStar,
    onToggleSave,
    onDelete,
    collectionType = 'explore'
}: SnippetCardProps) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        setMounted(true);
        if (user) {
            getFolders(user.uid, setFolders);
        }
    }, [user]);

    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
    const cardBg = theme === 'dark' ? 'bg-black/10' : 'bg-gray-50/50';

    const formatStars = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    const handleAddToFolder = async (folderId: string, folderName: string) => {
        if (!user) return;
        try {
            await addSnippetToFolder(user.uid, folderId, snippet.id);
            toast({
                title: 'Snippet Added',
                description: `"${snippet.title}" has been added to the "${folderName}" folder.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add snippet to folder.',
            });
        }
    };

    if (!mounted) {
        return <Skeleton className="h-[450px] w-full" />
    }

    const displayedTags = showAllTags ? snippet.tags : snippet.tags.slice(0, 2);

    return (
        <Card className="glassmorphic flex flex-col h-full transition-all duration-300 ease-in-out hover:border-accent hover:shadow-lg sm:max-w-none hover:-translate-y-1">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg flex-1 pr-2">{snippet.title}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onSelect && <DropdownMenuItem onClick={() => onSelect(snippet)}><Eye className="mr-2 h-4 w-4" /> View Snippet</DropdownMenuItem>}
                            {collectionType === 'my-snippets' && onDelete && (
                                <DropdownMenuItem onClick={() => onDelete(snippet.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            )}
                            {collectionType === 'saved' && onToggleSave && (
                                <DropdownMenuItem onClick={() => onToggleSave(snippet)}>
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    <span>Unsave</span>
                                </DropdownMenuItem>
                            )}
                            {collectionType === 'starred' && onToggleStar &&(
                                 <DropdownMenuItem onClick={() => onToggleStar(snippet)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    <span>Unstar</span>
                                </DropdownMenuItem>
                            )}
                            {user && (
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <FolderPlus className="mr-2 h-4 w-4" />
                                        <span>Add to Folder</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            {folders.length > 0 ? folders.map(folder => (
                                                <DropdownMenuItem key={folder.id} onClick={() => handleAddToFolder(folder.id, folder.name)}>
                                                    <span>{folder.name}</span>
                                                </DropdownMenuItem>
                                            )) : (
                                                <DropdownMenuItem disabled>No folders created</DropdownMenuItem>
                                            )}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex pt-2">
                     <div className={cn(badgeVariants({ variant: "secondary" }))}>
                        {snippet.language}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className={cn("rounded-lg overflow-hidden text-sm", cardBg)}>
                   <SyntaxHighlighter
                     language={snippet.language?.toLowerCase()}
                     style={syntaxTheme}
                     customStyle={{ margin: 0, padding: '1rem', background: 'transparent', height: '120px' }}
                     className="custom-scrollbar"
                     codeTagProps={{className: "font-code"}}
                   >
                     {snippet.codeSnippet || ''}
                   </SyntaxHighlighter>
                 </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                 <div className="flex w-full items-center gap-2">
                    {onSelect && (
                        <Button variant="outline" className="w-full" onClick={() => onSelect(snippet)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                    )}
                    {collectionType === 'explore' && onToggleSave && (
                        <Button 
                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity" 
                            onClick={() => onToggleSave(snippet)}
                        >
                            <Bookmark className={cn("mr-2 h-4 w-4", snippet.isSaved && "fill-current")} /> {snippet.isSaved ? 'Saved' : 'Save'}
                        </Button>
                    )}
                </div>
                 <div className="w-full space-y-3 pt-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{snippet.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        {displayedTags.map(tag => (
                             <button key={tag} onClick={() => onTagClick && onTagClick(tag)} className="rounded-full">
                                <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                                    {tag}
                                </Badge>
                             </button>
                        ))}
                        {snippet.tags.length > 2 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAllTags(!showAllTags)}>
                                {showAllTags ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span className="sr-only">{showAllTags ? 'Show less tags' : 'Show more tags'}</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-between items-center w-full pt-1">
                        <Link href={`/dashboard/profile/${snippet.authorUsername}`} className="flex items-center gap-2 group">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={snippet.avatar} alt={snippet.author} />
                                <AvatarFallback>{snippet.author?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">@{snippet.authorUsername}</span>
                        </Link>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TooltipProvider>
                                {onToggleStar && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="flex items-center gap-1" onClick={() => onToggleStar(snippet)}>
                                                <Star className={cn("h-4 w-4 transition-colors", snippet.isStarred ? "text-yellow-400 fill-yellow-400" : "hover:text-yellow-400")} />
                                                <span className="text-xs">{formatStars(snippet.starCount || 0)}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{snippet.isStarred ? 'Unstar' : 'Star'} Snippet</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                        </div>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}
