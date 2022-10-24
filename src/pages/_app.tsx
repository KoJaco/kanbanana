import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import MainLayout from '@/layouts/MainLayout';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        // Single shared layout approach.
        <ThemeProvider attribute="class">
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </ThemeProvider>
    );
}

export default MyApp;
