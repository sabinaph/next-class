"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Shield,
  PlayCircle,
  Target,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  LineChart,
} from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-5 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold border border-green-200 dark:border-green-800">
                <Sparkles className="h-4 w-4" />
                Updated Learning Experience
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
                Build Skills That
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                  Move Your Career Forward
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                Learn practical, in-demand skills with guided lessons, mentor support,
                and real project outcomes. NextClass helps you go from beginner to
                job-ready with clarity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/courses"
                  className="inline-flex justify-center items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-xl shadow-gray-900/10 dark:shadow-white/10"
                >
                  Explore Courses
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { label: "Learners", value: "2,000+" },
                  { label: "Courses", value: "120+" },
                  { label: "Completion", value: "92%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-3"
                  >
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right-5 duration-1000">
              <div className="rounded-3xl border border-green-100/70 dark:border-green-900/30 bg-white dark:bg-gray-900 shadow-2xl p-6">
                <div className="rounded-2xl bg-linear-to-br from-emerald-100 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Goal</p>
                      <p className="text-2xl font-bold">8 hrs</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                      <p className="text-2xl font-bold">67%</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-900 text-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Live Mentor Session</p>
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Saturday, 8:00 PM</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Structured path + project-based learning
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <Users className="h-5 w-5" />, label: "Active learners", value: "2,143" },
              { icon: <GraduationCap className="h-5 w-5" />, label: "Certificates issued", value: "1,287" },
              { icon: <LineChart className="h-5 w-5" />, label: "Avg. score increase", value: "38%" },
              { icon: <Shield className="h-5 w-5" />, label: "Trusted mentors", value: "54" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  {stat.icon}
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Learning Track</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Follow a focused path based on your goals, with courses curated by level and outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-white" />,
                title: "Foundation Track",
                desc: "Start from the basics with guided, beginner-friendly lessons.",
                points: ["Core concepts", "Hands-on exercises", "Weekly checkpoints"],
                color: "bg-slate-900",
              },
              {
                icon: <Target className="h-6 w-6 text-white" />,
                title: "Career Track",
                desc: "Build job-ready portfolio projects and interview confidence.",
                points: ["Capstone project", "Mentor feedback", "Career roadmap"],
                color: "bg-emerald-600",
              },
              {
                icon: <Briefcase className="h-6 w-6 text-white" />,
                title: "Professional Track",
                desc: "Upskill with advanced tools and practical case studies.",
                points: ["Advanced modules", "Case-based learning", "Industry insights"],
                color: "bg-indigo-600",
              },
            ].map((track) => (
              <div key={track.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${track.color}`}>
                  {track.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{track.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{track.desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {track.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How NextClass Works</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">A simple learning system designed for progress and consistency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Pick a path", desc: "Choose a track based on your level and goals." },
              { step: "02", title: "Learn by doing", desc: "Complete practical lessons and mini assignments." },
              { step: "03", title: "Get feedback", desc: "Receive guidance and mentor insights while learning." },
              { step: "04", title: "Earn outcomes", desc: "Finish projects and collect verified certificates." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <p className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400">STEP {item.step}</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Learners Say</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Real feedback from students using NextClass every week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Aayush K.",
                role: "BCA Student",
                quote: "The step-by-step curriculum helped me finish my first project confidently.",
              },
              {
                name: "Mina R.",
                role: "Frontend Intern",
                quote: "Mentor sessions were practical and straight to the point. Huge confidence boost.",
              },
              {
                name: "Rohit P.",
                role: "Job Switcher",
                quote: "I moved from beginner to interview-ready in a few months with clear direction.",
              },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">"{item.quote}"</p>
                <div className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-7">
          <div className="inline-flex items-center gap-2 text-emerald-300 font-medium">
            <Award className="h-5 w-5" />
            Start building your learning momentum today
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to level up your skills?</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join NextClass and access a structured platform built for practical learning, mentorship, and measurable progress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-xl transition shadow-lg shadow-green-900/50"
            >
              Get Started for Free
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-xl font-semibold text-gray-100"
            >
              View All Courses
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
