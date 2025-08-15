import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://quiz-maker.vercel.app"),
  title: "Quiz Maker",
  description: "Generate quizzes from your files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.className}`}>
      <body className="flex flex-col min-h-screen justify-between">
        <ThemeProvider attribute="class" enableSystem forcedTheme="light">
          <Toaster position="top-center" richColors />
          {children}
          <footer className="w-full">
            <div className="text-sm text-muted-foreground text-center py-4 ">
              made with <span className="text-destructive mx-1">♥️</span> by&nbsp;
              <a href="https://github.com/joaquinponzone" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                @joaquinponzone
              </a>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
