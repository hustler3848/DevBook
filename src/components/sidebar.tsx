"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CodeXml, Compass, LayoutDashboard, PlusCircle, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-snippets', label: 'My Snippets', icon: FileCode },
    { href: '/new-snippet', label: 'New Snippet', icon: PlusCircle },
    { href: '/dashboard/explore', label: 'Explore', icon: Compass },
];

export function NavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map(({ href, label, icon: Icon }) => (
                <Button
                    key={href}
                    asChild
                    variant={pathname === href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                >
                    <Link href={href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                    </Link>
                </Button>
            ))}
        </>
    )
}


export function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-background">
            <div className="h-16 flex items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <CodeXml className="h-6 w-6 text-foreground" />
                    <span className="font-bold font-headline">CodeSnippr</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
               <NavLinks />
            </nav>
        </aside>
    );
}
