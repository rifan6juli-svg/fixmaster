import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-110 gap-6">
        <Logo className="justify-center" />
        {children}
      </div>
    </main>
  );
}
