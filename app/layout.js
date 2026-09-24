import "./globals.css";
import Nav from "../components/Nav.js";

export const metadata = { title: "Bloom Inventory" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>🌸 Bloom Inventory</h1>
          <Nav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
