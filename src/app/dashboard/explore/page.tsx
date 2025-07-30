
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExploreLoading from './loading';

export default function DashboardExploreRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/explore');
    }, [router]);

    return <ExploreLoading />;
}
