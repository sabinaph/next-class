"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, PlusCircle, Send, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuizQuestion = {
  id: string;
  text: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: QuizOption[];
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdById: string;
  questions: QuizQuestion[];
  attempts: Array<{
    id: string;
    score: number;
    total: number;
    submittedAt: string | null;
  }>;
};

type DraftQuestion = {
  text: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  optionsCsv: string;
  correctIndexesCsv: string;
};

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([
    {
      text: "",
      type: "SINGLE_CHOICE",
      optionsCsv: "",
      correctIndexesCsv: "",
    },
  ]);
  const [answersByQuiz, setAnswersByQuiz] = useState<Record<string, Record<string, string[]>>>({});
  const [textAnswersByQuiz, setTextAnswersByQuiz] = useState<Record<string, Record<string, string>>>({});

  const isAllowed = useMemo(
    () => !!session?.user?.role && ["STUDENT", "INSTRUCTOR"].includes(session.user.role),
    [session?.user?.role]
  );
  const isInstructor = session?.user?.role === "INSTRUCTOR";

  const loadQuizzes = async () => {
    if (!isAllowed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/quizzes", { cache: "no-store" });
      const payload = (await response.json()) as { success?: boolean; quizzes?: Quiz[] };
      if (response.ok && payload.success) {
        setQuizzes(payload.quizzes || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAllowed) {
      void loadQuizzes();
    }
  }, [status, isAllowed]);

  const addDraftQuestion = () => {
    setDraftQuestions((prev) => [
      ...prev,
      {
        text: "",
        type: "SINGLE_CHOICE",
        optionsCsv: "",
        correctIndexesCsv: "",
      },
    ]);
  };

  const submitQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!isInstructor) return;

    setIsSubmitting(true);
    try {
      const questions = draftQuestions.map((question) => {
        const options = question.type === "SHORT_ANSWER"
          ? []
          : question.optionsCsv
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean);

        const correctIndexes = question.correctIndexesCsv
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => Number(value) - 1)
          .filter((value) => Number.isInteger(value) && value >= 0);

        return {
          text: question.text,
          type: question.type,
          options: options.map((optionText, index) => ({
            text: optionText,
            isCorrect: correctIndexes.includes(index),
          })),
        };
      });

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isPublished: true,
          questions,
        }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setDraftQuestions([
          {
            text: "",
            type: "SINGLE_CHOICE",
            optionsCsv: "",
            correctIndexesCsv: "",
          },
        ]);
        await loadQuizzes();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAttempt = async (quiz: Quiz) => {
    const selectedByQuestion = answersByQuiz[quiz.id] || {};
    const textByQuestion = textAnswersByQuiz[quiz.id] || {};

    const answers = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: selectedByQuestion[question.id] || [],
      textAnswer: textByQuestion[question.id] || "",
    }));

    const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (response.ok) {
      await loadQuizzes();
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">
        Loading quizzes...
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="mt-3 text-muted-foreground">
            Login as a student or instructor to access quizzes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Instructors create quizzes. Students attempt and track progress.
        </p>
      </div>

      {isInstructor ? (
        <form onSubmit={submitQuiz} className="mb-8 space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Create Quiz</h2>
          <div className="space-y-2">
            <Label htmlFor="quizTitle">Title</Label>
            <Input id="quizTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quizDescription">Description</Label>
            <Textarea id="quizDescription" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-4">
            {draftQuestions.map((question, index) => (
              <div key={index} className="rounded-xl border bg-background p-4 space-y-3">
                <p className="text-sm font-semibold">Question {index + 1}</p>
                <Input
                  value={question.text}
                  onChange={(e) =>
                    setDraftQuestions((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, text: e.target.value } : item))
                    )
                  }
                  placeholder="Question text"
                  required
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={question.type}
                  onChange={(e) =>
                    setDraftQuestions((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, type: e.target.value as DraftQuestion["type"] }
                          : item
                      )
                    )
                  }
                >
                  <option value="SINGLE_CHOICE">Single Choice</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>

                {question.type !== "SHORT_ANSWER" ? (
                  <>
                    <Input
                      value={question.optionsCsv}
                      onChange={(e) =>
                        setDraftQuestions((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, optionsCsv: e.target.value } : item))
                        )
                      }
                      placeholder="Options (comma separated)"
                      required
                    />
                    <Input
                      value={question.correctIndexesCsv}
                      onChange={(e) =>
                        setDraftQuestions((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, correctIndexesCsv: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Correct option indexes (e.g. 1 or 1,3)"
                      required
                    />
                  </>
                ) : null}
              </div>
            ))}

            <Button type="button" variant="outline" className="gap-2" onClick={addDraftQuestion}>
              <PlusCircle className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish Quiz
          </Button>
        </form>
      ) : null}

      <div className="space-y-6">
        {isLoading ? (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No quizzes available yet.</div>
        ) : (
          quizzes.map((quiz) => (
            <article key={quiz.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border px-2 py-1">{quiz.questions.length} questions</span>
                <span>{quiz.isPublished ? "Published" : "Draft"}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{quiz.title}</h2>
              {quiz.description ? <p className="mt-2 text-sm text-muted-foreground">{quiz.description}</p> : null}

              <div className="mt-4 space-y-4">
                {quiz.questions.map((question) => (
                  <div key={question.id} className="rounded-xl border bg-background p-4">
                    <p className="font-medium text-sm">{question.text}</p>

                    {question.type === "SHORT_ANSWER" ? (
                      <Textarea
                        rows={2}
                        className="mt-2"
                        value={textAnswersByQuiz[quiz.id]?.[question.id] || ""}
                        onChange={(e) =>
                          setTextAnswersByQuiz((prev) => ({
                            ...prev,
                            [quiz.id]: {
                              ...(prev[quiz.id] || {}),
                              [question.id]: e.target.value,
                            },
                          }))
                        }
                        placeholder="Write your answer"
                      />
                    ) : (
                      <div className="mt-2 space-y-2">
                        {question.options.map((option) => {
                          const isMulti = question.type === "MULTIPLE_CHOICE";
                          const selected = answersByQuiz[quiz.id]?.[question.id] || [];
                          const checked = selected.includes(option.id);

                          return (
                            <label key={option.id} className="flex items-center gap-2 text-sm">
                              <input
                                type={isMulti ? "checkbox" : "radio"}
                                checked={checked}
                                onChange={(e) => {
                                  setAnswersByQuiz((prev) => {
                                    const quizAnswers = { ...(prev[quiz.id] || {}) };
                                    const current = new Set(quizAnswers[question.id] || []);

                                    if (isMulti) {
                                      if (e.target.checked) current.add(option.id);
                                      else current.delete(option.id);
                                    } else {
                                      current.clear();
                                      if (e.target.checked) current.add(option.id);
                                    }

                                    quizAnswers[question.id] = Array.from(current);
                                    return { ...prev, [quiz.id]: quizAnswers };
                                  });
                                }}
                              />
                              {option.text}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => void submitAttempt(quiz)} className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Submit Attempt
                </Button>

                {quiz.attempts[0] ? (
                  <p className="text-sm text-muted-foreground">
                    Last score: {quiz.attempts[0].score}/{quiz.attempts[0].total}
                  </p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
