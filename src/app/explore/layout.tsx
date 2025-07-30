
import { Header } from '@/components/header';

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
