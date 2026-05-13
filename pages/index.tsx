import Head from "next/head";
import EmojiMaker from "@/components/EmojiMaker";

export default function Home() {
  return (
    <>
      <Head>
        <title>絵文字メーカー</title>
        <meta name="description" content="Slack・Discord・Teams などのSNS用カスタム絵文字を無料で簡単作成。テキストを入力するだけでオリジナル絵文字が作れる emoji maker です。" />
      </Head>
      <EmojiMaker />
    </>
  );
}
