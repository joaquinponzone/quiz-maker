import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Poppins, Lora, Fira_Code } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';

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

const firaCode = Fira_Code({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-code"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quiz-maker-v0.vercel.app"),
  title: "Quiz Maker",
  description: "Generate quizzes from your files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${lora.variable} ${firaCode.variable}`}>
      <body className="flex flex-col min-h-screen justify-between font-sans">
        <ThemeProvider attribute="class" enableSystem forcedTheme="light">
          <Toaster position="top-center" richColors />
          {children}
          <footer className="w-full">
            <div className="text-sm text-muted-foreground text-center py-4 ">
              hecho con <span className="text-destructive mx-1">♥️</span> por&nbsp;
              <a href="https://github.com/joaquinponzone" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                @joaquinponzone
              </a>
            </div>
          </footer>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}


