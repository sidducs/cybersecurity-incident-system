import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Cybersecurity Incident Correlation & Intelligence System',
  description: 'DBMS Experiential Learning Level 3 - Dual Paradigm (PostgreSQL + pgvector)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500 font-mono">
          DBMS Level 3 Experiential Learning · Dual-Paradigm: PostgreSQL 15 (Relational) + pgvector (HNSW) · PES University
        </footer>
      </body>
    </html>
  );
}

