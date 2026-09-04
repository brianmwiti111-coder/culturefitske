import "./globals.css";

export const metadata = {
  title: "CultureFitsKe",
  description: "Player & fan football kits, made to order.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
