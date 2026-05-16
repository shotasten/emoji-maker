import Head from "next/head";
import EmojiMaker from "@/components/EmojiMaker";

const SITE_URL = "https://emoji-maker.shotaste.com";
const TITLE = "絵文字メーカー｜Slack・Discord用カスタム絵文字を無料作成";
const DESCRIPTION = "Slack・Discord・Teams用の絵文字（スタンプ・リアクション）を無料で簡単に作成。リアルタイムで見ながらフォント・色・縁取りをカスタマイズ。";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* OGP */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content="絵文字メーカー" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="ja_JP" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "絵文字メーカー",
              url: SITE_URL,
            }),
          }}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <EmojiMaker />
    </>
  );
}
