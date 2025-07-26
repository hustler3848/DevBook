

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getFolders, createFolder } from '@/lib/firebase/firestore';
import type { Folder } from '@/types/folder';
import { CodeXml, Compass, LayoutDashboard, PlusCircle, FileCode, ChevronLeft, ChevronRight, Settings, Folder as FolderIcon, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-snippets', label: 'My Collection', icon: FileCode },
    { href: '/dashboard/explore', label: 'Explore', icon: Compass },
];

interface NavLinksProps {
    isCollapsed: boolean;
}

export function NavLinks({ isCollapsed }: NavLinksProps) {
    const pathname = usePathname();

    return (
        <>
            {links.map(({ href, label, icon: Icon }) => (
                <Tooltip key={href} delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            asChild
                            variant={pathname === href ? 'secondary' : 'ghost'}
                            className={cn(
                                "w-full justify-start h-10",
                                isCollapsed ? "justify-center px-0" : "px-3"
                            )}
                        >
                            <Link href={href}>
                                <Icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                                <span className={cn("truncate", isCollapsed && "sr-only")}>{label}</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" className="ml-2">
                            {label}
                        </TooltipContent>
                    )}
                </Tooltip>
            ))}
        </>
    )
}

function CreateFolderDialog({ isOpen, onOpenChange, onFolderCreated }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onFolderCreated: () => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;
        setIsSubmitting(true);
        try {
            await createFolder(user.uid, name, description);
            toast({ title: "Folder Created", description: `"${name}" has been created.` });
            onFolderCreated();
            onOpenChange(false);
            setName('');
            setDescription('');
        } catch (error) {
            console.error("Failed to create folder:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create folder." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>Organize your snippets into folders.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input id="folder-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., React Hooks" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="folder-description">Description (Optional)</Label>
                        <Input id="folder-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const unsubscribe = getFolders(user.uid, setFolders);
            return () => unsubscribe();
        }
    }, [user]);

    return (
        <>
            <aside className={cn(
                "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out fixed h-full z-50",
                isCollapsed ? "w-20" : "w-60"
            )}>
                <div className="h-16 flex items-center border-b px-6 relative">
                    <Link href="/dashboard" className="flex items-center space-x-2 overflow-hidden">
                        <CodeXml className="h-6 w-6 text-primary flex-shrink-0" />
                        <span className={cn("font-bold font-headline whitespace-nowrap transition-opacity duration-200", isCollapsed && "opacity-0")}>CodeSnippr</span>
                    </Link>
                </div>
                
                <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <nav className="px-4 py-4 space-y-1">
                       <NavLinks isCollapsed={isCollapsed} />
                       <Separator className="my-4" />
                        <div className="flex items-center justify-between h-8 px-3">
                             {!isCollapsed && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h3>}
                             <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCreateFolderOpen(true)}>
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Create Folder</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="ml-2">Create Folder</TooltipContent>
                             </Tooltip>
                        </div>
                        {folders.map(folder => (
                             <Tooltip key={folder.id} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        asChild
                                        variant={pathname === `/dashboard/folders/${folder.id}` ? 'secondary' : 'ghost'}
                                        className={cn(
                                            "w-full justify-start h-10",
                                            isCollapsed ? "justify-center px-0" : "px-3"
                                        )}
                                    >
                                        <Link href={`/dashboard/folders/${folder.id}`}>
                                            <FolderIcon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                                            <span className={cn("truncate", isCollapsed && "sr-only")}>{folder.name}</span>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="ml-2">
                                        {folder.name}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </nav>
                    <nav className="px-4 py-4 space-y-1 border-t mt-auto">
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                 <Button asChild variant="ghost" className={cn("w-full justify-start h-10", isCollapsed ? "justify-center px-0" : "px-3")}>
                                    <Link href="/dashboard/settings">
                                        <Settings className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                                        <span className={cn(isCollapsed && "sr-only")}>Settings</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                               <TooltipContent side="right" className="ml-2">Settings</TooltipContent>
                            )}
                        </Tooltip>
                    </nav>
                </div>


                <div className="absolute top-1/2 -right-[13px] z-10 -translate-y-1/2">
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <button 
                                onClick={toggleSidebar} 
                                className="h-7 w-7 bg-background hover:bg-muted text-muted-foreground rounded-full border flex items-center justify-center cursor-pointer"
                            >
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                <span className="sr-only">Toggle sidebar</span>
                            </button>
                        </TooltipTrigger>
                         <TooltipContent side="right" className="ml-2">
                            {isCollapsed ? 'Expand' : 'Collapse'}
                         </TooltipContent>
                     </Tooltip>
                </div>
            </aside>
            <CreateFolderDialog isOpen={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} onFolderCreated={() => {}}/>
        </>
    );
}
