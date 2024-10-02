"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const QueryProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [client] = useState(
        new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                },
            },
        })
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProviderWrapper;
