import Document, {
    DocumentContext,
    Head,
    Html,
    Main,
    NextScript,
} from 'next/document';
import { resetServerContext } from 'react-beautiful-dnd';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const page = await ctx.renderPage();
        const initialProps = await Document.getInitialProps(ctx);
        resetServerContext();
        return { ...initialProps };
    }
    // This <Head> element is to be used SOLELY for data you would like loaded on every single page.
    // See  https://nextjs.org/docs/advanced-features/custom-document
    render() {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                    {/* recognize manifest */}
                    {/* <link rel="manifest" href="/manifest.json" /> */}

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
                    {/* <script
                        src="node_modules/pouchdb/dist/pouchdb.min.js"
                        async
                    ></script> */}
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
