import { SignInForm } from "@/components/signin-form";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <SignInForm />
      </div>
    </main>
  );
}
