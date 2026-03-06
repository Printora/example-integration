import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DreamCanvas — AI Art Generation Platform",
  description:
    "Create stunning AI-generated artwork. Browse, create, and bring your imagination to life.",
};

export default function DreamCanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark">{children}</div>;
}
