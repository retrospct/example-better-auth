import { SignUpForm } from "@/components/signup-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="mt-2 text-gray-600">Create a new account</p>
        </div>

        <SignUpForm />
      </div>
    </main>
  );
}
