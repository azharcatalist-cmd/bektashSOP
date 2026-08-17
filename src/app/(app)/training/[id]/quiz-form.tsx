"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradeQuiz } from "../actions";

export type QuizQuestion = {
  id: string;
  position: number;
  question: string;
  options: string[];
};

type Result = { passed: boolean; pct: number; correct: number; total: number; passMark: number };

export default function QuizForm({
  moduleId,
  questions,
}: {
  moduleId: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  function submit() {
    startTransition(async () => {
      const res = await gradeQuiz(
        moduleId,
        questions.map((_, i) => answers[i])
      );
      setResult(res);
      if (res.passed) router.refresh();
    });
  }

  if (result?.passed) {
    return (
      <div className="card mt-6 border-emerald-500/40 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-1 font-semibold text-emerald-400">
          Passed — {result.pct}% ({result.correct}/{result.total} correct)
        </p>
        <p className="mt-1 text-sm text-zinc-400">Module marked complete.</p>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-zinc-400">
        Knowledge check
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        Answer all questions. You need 80% to complete this module — you can retry as many
        times as you like.
      </p>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="card">
            <p className="text-sm font-semibold text-zinc-100">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [qi]: oi }));
                    setResult(null);
                  }}
                  className={`block w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    answers[qi] === oi
                      ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
                      : "border-brand-line bg-brand-surface text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result && !result.passed && (
        <p className="mt-4 text-sm font-semibold text-red-400">
          {result.pct}% ({result.correct}/{result.total}) — you need {result.passMark}%. Review
          the lessons above and try again.
        </p>
      )}

      <button
        className="btn-primary mt-4 w-full md:w-auto"
        disabled={!allAnswered || pending}
        onClick={submit}
      >
        {pending ? "Checking…" : "Submit answers"}
      </button>
    </section>
  );
}
