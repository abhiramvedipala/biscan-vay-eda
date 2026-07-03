import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-medium tracking-tight text-[#1a1a1a]">iTrack</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your application tracker</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
