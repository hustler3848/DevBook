import { DashboardHeader } from '@/components/dashboard-header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <DashboardHeader />
            <main className="flex-1 container px-4 py-6 sm:py-8">{children}</main>
        </div>
    );
}
