import Head from "next/head";
import Link from "next/link";

const SITE_URL = "https://emoji-maker.shotaste.com";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>プライバシーポリシー｜絵文字メーカー</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 絵文字メーカーに戻る
          </Link>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">プライバシーポリシー</h1>

          <div className="prose prose-gray text-gray-600 leading-relaxed flex flex-col gap-4">
            <p>
              絵文字メーカーの Chrome 拡張機能は、Slack にログインしているワークスペース一覧と、絵文字を登録するための一時トークンを読み取ります。
              どちらも Slack への登録処理だけに使っていて、外部に送ったり、どこかに保存したりはしていません。
            </p>

            <p>
              アップロード先は、あなたが選んだ Slack ワークスペースだけです。
            </p>

            <p>
              何か気になることがあれば{" "}
              <a
                href="https://github.com/shotasten/emoji-maker-chrome-extension/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                GitHub の Issue
              </a>{" "}
              に書いてもらえると助かります。
            </p>
          </div>
        </main>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          © 2026 絵文字メーカー
        </footer>
      </div>
    </>
  );
}
