import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Poppins, Lora } from "next/font/google";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

const lora = Lora({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora"
});

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
    <html lang="en" suppressHydrationWarning className={`${poppins.className} ${lora.className}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap"
        />
      </head>
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


