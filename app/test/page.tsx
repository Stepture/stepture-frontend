import DocumentCard from "@/components/ui/DocumentCard";

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
      <DocumentCard
        logoSrc="/AUlogo.png"
        websiteName="Assumption University"
        docTitle="Exploring Assumption University Website on Chrome"
        author="MB Triad"
        stepCount={10}
        estimatedTime="15 Minutes"
      />
    </div>
  );
}
