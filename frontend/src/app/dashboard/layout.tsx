import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F2EE]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Subtle dot grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#00000008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        <Navbar />
        
        <main className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
          <div className="w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
