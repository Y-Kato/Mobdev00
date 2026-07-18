import "./globals.css";

export const metadata = {
  title: "Snake Bird Mini",
  description: "スネークバード風ミニゲームを遊べる Next.js アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}