"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { callProductApi } from "@/lib/product-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Calling API...
        </>
      ) : (
        "Call Product API"
      )}
    </button>
  );
}

export function ProductApiButton() {
  const [state, formAction] = useActionState(callProductApi, null);

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state && (
        <Card className="w-full max-w-md">
          {state.success && state.data ? (
            <>
              <CardHeader>
                <CardTitle className="text-green-600">✓ Success</CardTitle>
                <CardDescription>
                  Product API verified your session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-semibold">User ID:</span>{" "}
                  <span className="text-gray-700">{state.data.id}</span>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="text-gray-700">{state.data.email}</span>
                </div>
                {state.data.name && (
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    <span className="text-gray-700">{state.data.name}</span>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-red-600">✗ Error</CardTitle>
                <CardDescription>Failed to call Product API</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">
                  {"error" in state ? state.error : "An error occurred"}
                </p>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
