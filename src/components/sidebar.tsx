

"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { CodeXml, Compass, LayoutDashboard, PlusCircle, FileCode, ChevronLeft, ChevronRight, Settings, Star, Bookmark, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-snippets', label: 'My Collection', icon: FileCode },
    { href: '/dashboard/new-snippet', label: 'New Snippet', icon: PlusCircle },
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

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const username = user?.email ? 'currentuser' : 'guest';
    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
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
                    
                    {isCollapsed ? (
                         <div className="flex flex-col items-center gap-2">
                             <ThemeToggle />
                              {loading ? (
                                <Skeleton className="h-10 w-10 rounded-full" />
                              ) : user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={user.displayName || "user avatar"} data-ai-hint="user avatar" />
                                                <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="ml-2 mb-2" side="right" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.displayName || 'Username'}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/profile/${username}`}><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Logout</span></DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                              ) : null}
                         </div>
                    ) : (
                        <>
                             <ThemeToggle />
                            {loading ? (
                                <Skeleton className="h-10 w-full rounded-md" />
                            ) : user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start h-12 px-3">
                                            <Avatar className="h-9 w-9 mr-2">
                                                <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={user.displayName || "user avatar"} data-ai-hint="user avatar" />
                                                <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start truncate">
                                                <span className="text-sm font-medium leading-none truncate">{user.displayName || 'Username'}</span>
                                                <span className="text-xs leading-none text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                     <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/profile/${username}`}><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Logout</span></DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null}
                        </>
                    )}
                   
                </nav>
            </div>


            <div className="absolute top-16 -right-[13px] z-10">
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
    );
}
