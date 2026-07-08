import "./globals.css";

export const metadata = {
  title: "Greeting App",
  description: "入力した名前に合わせてあいさつを返す Next.js アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}