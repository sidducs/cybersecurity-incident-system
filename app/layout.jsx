import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Cybersecurity Incident Management System',
  description: 'DBMS Experiential Learning - PES University',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-900 bg-black py-3 text-center text-xs text-zinc-600">
          DBMS Experiential Learning Level 3 · PostgreSQL & pgvector · PES University
        </footer>
      </body>
    </html>
  );
}
