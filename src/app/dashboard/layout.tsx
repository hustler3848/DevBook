
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
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
        <div className="min-h-screen w-full flex">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className={cn(
                "flex flex-col w-full transition-all duration-300 ease-in-out h-screen",
                isSidebarCollapsed ? "md:ml-20" : "md:ml-60"
            )}>
                <DashboardHeader />
                <main className="flex-1 px-4 py-6 sm:py-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
