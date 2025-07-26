
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard-header';

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
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <div className="mx-auto max-w-screen-2xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
