import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
            <div id="modal-root"></div>
          </>,
        ],
      };
    } finally {
      sheet.seal();
    }
  }
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link rel="canonical" href="https://bodytory-ruddy.vercel.app/" />
          <meta
            property="og:image"
            content="https://imagedelivery.net/AbuMCvvnFZBtmCKKJV_e6Q/3103f60d-b28b-4425-d047-927327e5fb00/public"
          />
          <script src="https://developers.kakao.com/sdk/js/kakao.js" async />
          <script
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&libraries=services,clusterer&autoload=false`}
            async
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
