import type React from "react";
import ArtistNavbar from "./components/ArtistNavbar";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArtistNavbar />
      {children}
    </>
  );
}
