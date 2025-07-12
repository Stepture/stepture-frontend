import DocumentNavbar from "./components/DocumentNavbar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocumentNavbar />
      {children}
    </>
  );
}
