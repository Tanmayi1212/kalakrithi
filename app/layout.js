import "../styles/global.css";

export const metadata = {
  title: "Kalakrithi - Indian Folk Art Platform",
  description: "Celebrating traditional Indian art forms and cultural heritage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
