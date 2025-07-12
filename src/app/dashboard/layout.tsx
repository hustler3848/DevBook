
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className={cn(
                "flex flex-col w-full transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "md:pl-20" : "md:pl-60"
            )}>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-6 sm:pt-8 md:pt-10">
                    <div className="mx-auto max-w-screen-2xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
