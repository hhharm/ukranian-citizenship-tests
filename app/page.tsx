import { Suspense } from "react";
import QuizApp from "@/components/QuizApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Suspense>
          <QuizApp />
        </Suspense>
      </div>
    </main>
  );
}
