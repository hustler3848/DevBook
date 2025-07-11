

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CodeXml, Compass, LayoutDashboard, PlusCircle, FileCode, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-snippets', label: 'My Snippets', icon: FileCode },
    { href: '/dashboard/new-snippet', label: 'New Snippet', icon: PlusCircle },
    { href: '/dashboard/explore', label: 'Explore', icon: Compass },
];

const bottomLinks = [
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

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
    const pathname = usePathname();
    return (
        <aside className={cn(
            "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out fixed h-full z-50",
            isCollapsed ? "w-20" : "w-60"
        )}>
            <div className="h-16 flex items-center border-b px-6 relative">
                <Link href="/dashboard" className="flex items-center space-x-2 overflow-hidden">
                    <CodeXml className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className={cn("font-bold font-headline whitespace-nowrap", isCollapsed && "opacity-0")}>CodeSnippr</span>
                </Link>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
                <nav className="px-4 py-4 space-y-1">
                   <NavLinks isCollapsed={isCollapsed} />
                </nav>
                <nav className="px-4 py-4 space-y-1 border-t">
                    {bottomLinks.map(({ href, label, icon: Icon }) => (
                        <Tooltip key={href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
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
                </nav>
            </div>


            <div className="absolute top-1/2 -right-[13px] transform -translate-y-1/2 z-10">
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
