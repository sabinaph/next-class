"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Filter, Loader2, PlayCircle, PlusCircle, RotateCcw, Search, Send, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardIllustration } from "@/components/ui/card-illustration";
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
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [scoreVisibleQuizId, setScoreVisibleQuizId] = useState<string | null>(null);
  const [isAttemptSubmitting, setIsAttemptSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attemptFilter, setAttemptFilter] = useState<"ALL" | "ATTEMPTED" | "NOT_ATTEMPTED">("ALL");
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
  const activeQuiz = activeQuizId ? quizzes.find((quiz) => quiz.id === activeQuizId) || null : null;
  const attemptedCount = useMemo(
    () => quizzes.filter((quiz) => quiz.attempts.length > 0).length,
    [quizzes]
  );
  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const hasAttempt = quiz.attempts.length > 0;
      const matchesAttempt =
        attemptFilter === "ALL" ||
        (attemptFilter === "ATTEMPTED" && hasAttempt) ||
        (attemptFilter === "NOT_ATTEMPTED" && !hasAttempt);

      const haystack = `${quiz.title} ${quiz.description || ""}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);

      return matchesAttempt && matchesSearch;
    });
  }, [quizzes, searchQuery, attemptFilter]);

  const loadQuizzes = async () => {
    if (!isAllowed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/quizzes", { cache: "no-store" });
      const payload = (await response
        .json()
        .catch(() => null)) as { success?: boolean; quizzes?: Quiz[] } | null;
      if (response.ok && payload?.success) {
        setQuizzes(payload.quizzes || []);
      } else {
        setQuizzes([]);
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
    setIsAttemptSubmitting(true);

    const selectedByQuestion = answersByQuiz[quiz.id] || {};
    const textByQuestion = textAnswersByQuiz[quiz.id] || {};

    const answers = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: selectedByQuestion[question.id] || [],
      textAnswer: textByQuestion[question.id] || "",
    }));

    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        setActiveQuizId(null);
        setScoreVisibleQuizId(quiz.id);
        await loadQuizzes();
      }
    } finally {
      setIsAttemptSubmitting(false);
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
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm lg:p-8">
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Quiz Arena
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">Sharpen Skills With Smart Quizzes</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Build quiz muscle with focused rounds, instant scores, and clean progress tracking across every attempt.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Total Quizzes</p>
                <p className="mt-1 text-lg font-semibold">{quizzes.length}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Attempted</p>
                <p className="mt-1 text-lg font-semibold">{attemptedCount}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="mt-1 text-lg font-semibold">{Math.max(quizzes.length - attemptedCount, 0)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm lg:p-8">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-primary" />
            Find Your Next Quiz
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quizSearch">Search quizzes</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="quizSearch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or description"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attempt status</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={attemptFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setAttemptFilter("ALL")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={attemptFilter === "ATTEMPTED" ? "default" : "outline"}
                  onClick={() => setAttemptFilter("ATTEMPTED")}
                >
                  Attempted
                </Button>
                <Button
                  type="button"
                  variant={attemptFilter === "NOT_ATTEMPTED" ? "default" : "outline"}
                  onClick={() => setAttemptFilter("NOT_ATTEMPTED")}
                >
                  Not Attempted
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredQuizzes.length}</span> of {quizzes.length} quizzes.
            </p>
          </div>
        </section>
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
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No quizzes matched your search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredQuizzes.map((quiz) => {
              const latestAttempt = quiz.attempts[0];
              const hasAttempt = Boolean(latestAttempt);
              const isActive = activeQuizId === quiz.id;
              const showScore = scoreVisibleQuizId === quiz.id;

              return (
                <article key={quiz.id} className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardIllustration variant="quiz" className="-right-8 top-2 h-28 w-32 opacity-70" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-2 py-1">{quiz.questions.length} questions</span>
                    <span
                      className={`rounded-full px-2 py-1 ${
                        hasAttempt
                          ? "border border-primary/35 bg-primary/10 text-primary"
                          : "border border-border bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {hasAttempt ? "Attempted" : "Not Attempted"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">{quiz.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {quiz.description || "No description provided for this quiz."}
                  </p>

                  {showScore && latestAttempt ? (
                    <div className="mt-4 rounded-xl border bg-background p-3 text-sm">
                      <p className="font-medium">Score: {latestAttempt.score}/{latestAttempt.total}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {latestAttempt.submittedAt
                          ? `Submitted on ${new Date(latestAttempt.submittedAt).toLocaleString()}`
                          : "Submitted"}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {hasAttempt ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setScoreVisibleQuizId((prev) => (prev === quiz.id ? null : quiz.id))
                          }
                        >
                          View Score
                        </Button>
                        <Button
                          className="gap-2"
                          onClick={() => {
                            setActiveQuizId(quiz.id);
                            setScoreVisibleQuizId(null);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reattempt
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="gap-2"
                        onClick={() => {
                          setActiveQuizId(quiz.id);
                          setScoreVisibleQuizId(null);
                        }}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Start Quiz
                      </Button>
                    )}

                    {isActive ? (
                      <span className="text-xs text-emerald-600">Quiz opened below</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {activeQuiz ? (
        <section className="mt-8 rounded-2xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{activeQuiz.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Answer all questions and submit your attempt.</p>
          </div>

          <div className="space-y-4">
            {activeQuiz.questions.map((question) => (
              <div key={question.id} className="rounded-xl border bg-background p-4">
                <p className="text-sm font-medium">{question.text}</p>

                {question.type === "SHORT_ANSWER" ? (
                  <Textarea
                    rows={2}
                    className="mt-2"
                    value={textAnswersByQuiz[activeQuiz.id]?.[question.id] || ""}
                    onChange={(e) =>
                      setTextAnswersByQuiz((prev) => ({
                        ...prev,
                        [activeQuiz.id]: {
                          ...(prev[activeQuiz.id] || {}),
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
                      const selected = answersByQuiz[activeQuiz.id]?.[question.id] || [];
                      const checked = selected.includes(option.id);

                      return (
                        <label key={option.id} className="flex items-center gap-2 text-sm">
                          <input
                            type={isMulti ? "checkbox" : "radio"}
                            checked={checked}
                            onChange={(e) => {
                              setAnswersByQuiz((prev) => {
                                const quizAnswers = { ...(prev[activeQuiz.id] || {}) };
                                const current = new Set(quizAnswers[question.id] || []);

                                if (isMulti) {
                                  if (e.target.checked) current.add(option.id);
                                  else current.delete(option.id);
                                } else {
                                  current.clear();
                                  if (e.target.checked) current.add(option.id);
                                }

                                quizAnswers[question.id] = Array.from(current);
                                return { ...prev, [activeQuiz.id]: quizAnswers };
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
            <Button
              onClick={() => void submitAttempt(activeQuiz)}
              className="gap-2"
              disabled={isAttemptSubmitting}
            >
              {isAttemptSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              Submit Attempt
            </Button>

            <Button variant="outline" onClick={() => setActiveQuizId(null)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
