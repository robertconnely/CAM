"use client";

import { usePathname } from "next/navigation";
import { CamSidebar } from "@/components/cam/CamSidebar";

export default function CamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
      }}
    >
      <CamSidebar currentPath={pathname} />
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--zelis-light-gray, #F5F5F5)",
          height: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
