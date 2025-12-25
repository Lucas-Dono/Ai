import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentación | Blaniel",
  description: "Aprende a usar Blaniel: guías, tutoriales y mejores prácticas para crear compañeros virtuales increíbles.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <DocsSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
