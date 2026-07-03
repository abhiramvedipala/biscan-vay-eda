import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { getCurrentUserEmail } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userEmail = await getCurrentUserEmail();

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex">
        <Sidebar userEmail={userEmail} />
      </div>
      <main className="min-h-screen w-full flex-1 overflow-x-hidden pb-16 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
