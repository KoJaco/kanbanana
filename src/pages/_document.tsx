import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    // This <Head> element is to be used SOLELY for data you would like loaded on every single page.
    // See  https://nextjs.org/docs/advanced-features/custom-document
    render() {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" name="theme-color" content="#fff" />
                    {/* recognize manifest */}
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="apple-touch-icon" href="/icon.png"></link>

                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="anonymous"
                    />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body className="h-full">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
