import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "WorkStak",
  description: "Project Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
