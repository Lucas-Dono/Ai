import { BusinessSidebar } from "@/components/business/layout/BusinessSidebar";
import { BusinessHeader } from "@/components/business/layout/BusinessHeader";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-business-primary">
      <BusinessSidebar />
      <div
        className="flex flex-col"
        style={{ marginLeft: "var(--business-sidebar-width)" }}
      >
        <BusinessHeader />
        <main
          className="flex-1 p-6 md:p-8"
          style={{ marginTop: "var(--business-header-height)" }}
        >
          <div className="mx-auto max-w-[1800px] space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
