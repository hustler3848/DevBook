

"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogClose, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bookmark, Copy, Star, Check, X, Wand2, MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import type { Snippet } from '@/types/snippet';
import type { Comment } from '@/types/comment';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { explainAndReviewCode, type ExplainCodeOutput } from '@/ai/flows/explain-code';
import { addComment, deleteComment, getComments } from '@/lib/firebase/firestore';
import { CodeExplanationDialog } from './code-explanation-dialog';


interface SnippetViewDialogProps {
  snippet: Snippet;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onToggleStar: (snippet: Snippet) => void;
  onToggleSave: (snippet: Snippet) => void;
}

const CommentsSection = ({ snippetId }: { snippetId: string }) => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!snippetId) return;

        setIsLoading(true);
        const unsubscribe = getComments(snippetId, (fetchedComments) => {
            setComments(fetchedComments);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [snippetId]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment(snippetId, user.uid, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add your comment. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(snippetId, commentId);
            toast({ title: "Comment deleted." });
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the comment.'
            });
        }
    };


    return (
        <div className="space-y-6 pt-4">
            <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussion
            </h3>

            {user && (
                <form onSubmit={handleAddComment} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            placeholder="Add your comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px]"
                        />
                         <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()} className="mt-2">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post Comment
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}
                {!isLoading && comments.length === 0 && (
                    <p className="text-sm text-center py-4 text-muted-foreground">Be the first to comment.</p>
                )}
                {comments.map(comment => (
                     <div key={comment.id} className="flex items-start gap-3">
                        <Link href={`/dashboard/profile/${comment.authorUsername}`}>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                     <Link href={`/dashboard/profile/${comment.authorUsername}`} className="font-semibold text-sm hover:underline">
                                        {comment.authorName}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                                    </span>
                                </div>
                                {user?.uid === comment.authorId && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteComment(comment.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete comment</span>
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SnippetViewDialog({ snippet, isOpen, onOpenChange, onToggleStar, onToggleSave }: SnippetViewDialogProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ExplainCodeOutput | null>(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
        setIsCopied(false);
    }
  },[isOpen]);
  
  useEffect(() => {
    if (!isExplanationOpen) {
      setExplanationResult(null);
    }
  }, [isExplanationOpen]);

  const handleCopyCode = () => {
    if(!snippet.codeSnippet) return;
    navigator.clipboard.writeText(snippet.codeSnippet);
    setIsCopied(true);
    toast({
        title: "Copied to clipboard!",
        description: "You can now paste the code in your editor.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExplainCode = async () => {
    setIsExplanationOpen(true);
    setIsExplanationLoading(true);
    try {
        const result = await explainAndReviewCode({
            codeSnippet: snippet.codeSnippet,
            language: snippet.language
        });
        setExplanationResult(result);
    } catch (error) {
        console.error("Failed to get code explanation:", error);
        toast({
            variant: "destructive",
            title: "AI Analysis Failed",
            description: "Could not get an explanation for this snippet."
        });
        setIsExplanationOpen(false);
    } finally {
        setIsExplanationLoading(false);
    }
  }

  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
  
  if (!mounted) {
    return null;
  }

  const formatStars = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formattedDate = snippet.createdAt ? format(snippet.createdAt.toDate(), "MMM dd, yyyy") : 'N/A';

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogOverlay className="backdrop-blur-sm" />
       <DialogContent 
         className={cn(
           "p-0 max-w-4xl w-[calc(100%-2rem)] sm:w-full flex flex-col gap-0 max-h-[90vh] overflow-hidden rounded-lg",
           "fixed sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
         )}
       >
        <DialogTitle asChild>
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b">
              <h2 className="font-headline text-lg font-bold truncate pr-8">{snippet.title}</h2>
              <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                  </Button>
              </DialogClose>
          </header>
        </DialogTitle>
        <DialogDescription className="sr-only">
            Detailed view of the code snippet: {snippet.title}. Contains code, description, tags, and actions.
        </DialogDescription>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 space-y-6">
            
            <Link href={`/dashboard/profile/${snippet.authorUsername}`} className="inline-flex items-center gap-3 group">
              <Avatar className="h-10 w-10">
                <AvatarImage src={snippet.avatar} alt={snippet.author} />
                <AvatarFallback>{snippet.author?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{snippet.author}</p>
                <p className="text-xs text-muted-foreground">Published on {formattedDate}</p>
              </div>
            </Link>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{snippet.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{snippet.language}</Badge>
                {snippet.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
            </div>

            <div className="rounded-lg border bg-background overflow-hidden relative">
              <SyntaxHighlighter
                language={snippet.language?.toLowerCase()}
                style={syntaxTheme}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  maxHeight: 'calc(90vh - 400px)',
                  fontSize: '13px',
                }}
                className="custom-scrollbar"
                codeTagProps={{ className: "font-code" }}
              >
                {snippet.codeSnippet || ''}
              </SyntaxHighlighter>
              <Button onClick={handleCopyCode} size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8">
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4"/>}
                  <span className="sr-only">Copy Code</span>
              </Button>
            </div>
             <CommentsSection snippetId={snippet.id} />
          </div>
        </div>

        <footer className="flex-shrink-0 flex items-center justify-between gap-2 p-3 border-t bg-background/95">
           <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-1.5" onClick={() => onToggleStar(snippet)}>
                <Star className={cn("h-4 w-4", snippet.isStarred && "text-yellow-400 fill-yellow-400")} />
                <span className="font-bold">{formatStars(snippet.starCount || 0)}</span>
              </Button>
               <Button variant="outline" className="flex items-center gap-1.5 px-3 sm:px-4" onClick={() => onToggleSave(snippet)}>
                    <Bookmark className={cn("h-4 w-4", snippet.isSaved && "text-primary fill-primary")} />
                    <span className="hidden sm:inline">{snippet.isSaved ? 'Saved' : 'Save'}</span>
                </Button>
              <Button variant="outline" className="flex items-center gap-1.5" onClick={handleExplainCode}>
                <Wand2 className="h-4 w-4 text-primary"/>
                <span>Explain</span>
              </Button>
           </div>
           <Button onClick={handleCopyCode} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity px-3 sm:px-4">
                <Copy className="mr-0 sm:mr-2 h-4 w-4"/>
                <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy Code'}</span>
           </Button>
        </footer>
       </DialogContent>
    </Dialog>
    <CodeExplanationDialog 
        isOpen={isExplanationOpen} 
        onOpenChange={setIsExplanationOpen}
        isLoading={isExplanationLoading}
        result={explanationResult}
        snippetLanguage={snippet.language}
    />
    </>
  );
}
