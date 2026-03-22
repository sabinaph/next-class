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
  Star,
  Clock3,
  Code2,
  ExternalLink,
  Github,
  Globe,
  XCircle,
  Linkedin,
  Video,
  CalendarClock,
} from "lucide-react";

export default function Home() {
  const featuredCourses = [
    {
      title: "Web Development Bootcamp",
      duration: "12 weeks",
      level: "Beginner",
      rating: "4.9",
      students: "3,240",
      highlight: "Build 4 deployable full-stack projects",
    },
    {
      title: "UI/UX Design Basics",
      duration: "6 weeks",
      level: "Beginner",
      rating: "4.8",
      students: "1,980",
      highlight: "Design portfolio-ready Figma case studies",
    },
    {
      title: "Python for Beginners",
      duration: "8 weeks",
      level: "Beginner",
      rating: "4.8",
      students: "2,760",
      highlight: "Automate real tasks and analyze data",
    },
    {
      title: "Frontend Interview Sprint",
      duration: "4 weeks",
      level: "Intermediate",
      rating: "4.9",
      students: "1,120",
      highlight: "Mock interviews + curated question bank",
    },
  ];

  const projectShowcase = [
    {
      title: "E-commerce Dashboard",
      student: "Nikita S.",
      stack: "React, TypeScript, Tailwind",
      result: "Now working at a startup in Kathmandu",
    },
    {
      title: "Travel Planner App",
      student: "Prabin R.",
      stack: "Next.js, Prisma, PostgreSQL",
      result: "Converted capstone into freelance product",
    },
    {
      title: "Fitness Tracking PWA",
      student: "Sushma B.",
      stack: "Vue, Firebase, Charts",
      result: "Used in 2 internship interviews",
    },
  ];

  const roadmap = [
    { phase: "Week 1-2", title: "Core Basics", desc: "Foundations, tools, and guided exercises." },
    { phase: "Week 3-5", title: "Project Building", desc: "Build guided mini projects with mentor checkpoints." },
    { phase: "Week 6-8", title: "Advanced + Portfolio", desc: "Architecture, polish, and portfolio proof." },
    { phase: "Week 9-10", title: "Interview Prep", desc: "Mock interviews, resume optimization, confidence drills." },
  ];

  const faqs = [
    {
      q: "Do I need prior coding experience?",
      a: "No. Beginner paths start from absolute basics and gradually move to project implementation.",
    },
    {
      q: "How much time should I commit each week?",
      a: "Most learners progress with 6-8 focused hours weekly. You can learn at your own pace.",
    },
    {
      q: "Will I build real projects?",
      a: "Yes. Every track includes practical projects designed to be showcased in your portfolio.",
    },
    {
      q: "Are certificates included?",
      a: "Yes. Free includes basic certificates, while Pro includes verified certificates.",
    },
  ];

  return (
    <main suppressHydrationWarning>
      <section className="relative overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28" suppressHydrationWarning>
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

      <section className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800" suppressHydrationWarning>
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

      <section className="py-18 bg-linear-to-b from-white to-emerald-50/30 dark:from-gray-950 dark:to-gray-900/60" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Target className="h-3.5 w-3.5" />
              What You&apos;ll Become
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Not just learning. Career transformation.
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Become a job-ready developer with structured outcomes, project depth,
              and interview confidence in weeks, not years.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              "Become a job-ready Frontend Developer in 12 weeks",
              "Build 5 real projects + a portfolio you can show",
              "Crack interviews with confidence and guidance",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-gray-900 p-6">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Popular pathways learners are taking right now.</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              View all 120+ courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {featuredCourses.map((course) => (
              <div key={course.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{course.highlight}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-600" />{course.duration}</p>
                  <p className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" />{course.level}</p>
                  <p className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" />{course.rating} rating</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-600" />{course.students} enrolled</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-b from-emerald-50/30 to-white dark:from-gray-900 dark:to-gray-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Real Projects Showcase</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Built by our learners. Shipped in the real world.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectShowcase.map((project, idx) => (
              <div key={project.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className={`aspect-video p-6 text-white ${idx % 3 === 0 ? "bg-linear-to-br from-emerald-600 to-teal-700" : idx % 3 === 1 ? "bg-linear-to-br from-slate-700 to-slate-900" : "bg-linear-to-br from-indigo-600 to-blue-700"}`}>
                  <Code2 className="h-6 w-6 mb-3" />
                  <p className="text-lg font-bold">{project.title}</p>
                  <p className="text-sm text-white/85 mt-1">{project.stack}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Built by {project.student}</p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{project.result}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <a href="#" className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium"><Github className="h-4 w-4" />GitHub</a>
                    <a href="#" className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium"><Globe className="h-4 w-4" />Live Demo</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Before vs After NextClass</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">See the transformation our structured system creates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/60 dark:bg-red-950/10 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Before NextClass</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {["Confused roadmap", "No portfolio", "No mentor guidance"].map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-950/10 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">After NextClass</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {["Built 3+ projects", "Resume and portfolio ready", "Interview confident"].map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Roadmap Preview</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">A structured system that keeps you progressing every week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {roadmap.map((item) => (
              <div key={item.phase} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <p className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400">{item.phase}</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950" suppressHydrationWarning>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <Video className="h-4 w-4" />
                  60-90 sec Intro
                </p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">See how NextClass works in one minute</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Understand what NextClass is, who it&apos;s for, and what outcomes you can expect before you start.
                </p>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black/80">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="NextClass Intro Video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-b from-white to-emerald-50/20 dark:from-gray-950 dark:to-gray-900/40" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing: Free vs Pro</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Clear options. No confusion.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/70">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-left font-semibold">Free</th>
                  <th className="px-4 py-3 text-left font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Courses", "Limited", "All"],
                  ["Mentorship", "No", "Yes"],
                  ["Certificates", "Basic", "Verified"],
                  ["Interview Prep", "Limited", "Full Sprint"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row[1]}</td>
                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-semibold">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950" suppressHydrationWarning>
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

      <section className="py-20 bg-white dark:bg-gray-950" suppressHydrationWarning>
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
                company: "Now at PixelForge",
                quote: "The step-by-step curriculum helped me finish my first project confidently.",
              },
              {
                name: "Mina R.",
                role: "Frontend Intern",
                company: "Now at Nova Labs",
                quote: "Mentor sessions were practical and straight to the point. Huge confidence boost.",
              },
              {
                name: "Rohit P.",
                role: "Job Switcher",
                company: "Now at BrightSoft",
                quote: "I moved from beginner to interview-ready in a few months with clear direction.",
              },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.role}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white dark:bg-gray-800 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    <Linkedin className="h-3 w-3" />
                    LinkedIn
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">"{item.quote}"</p>
                <div className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">{item.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Who Is This For?</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Designed for serious learners at different starting points.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Students", desc: "Build practical skills before graduation.", icon: <GraduationCap className="h-5 w-5" /> },
              { title: "Job Switchers", desc: "Move into tech with a structured roadmap.", icon: <Briefcase className="h-5 w-5" /> },
              { title: "Beginners", desc: "Start from zero with guided support.", icon: <BookOpen className="h-5 w-5" /> },
              { title: "Working Professionals", desc: "Upskill for faster career growth.", icon: <LineChart className="h-5 w-5" /> },
            ].map((group) => (
              <div key={group.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
                <div className="inline-flex rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-2">
                  {group.icon}
                </div>
                <h3 className="mt-3 font-bold text-gray-900 dark:text-white">{group.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{group.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Everything you need before you start.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 dark:text-white flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-emerald-600 dark:text-emerald-300 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 text-white relative overflow-hidden" suppressHydrationWarning>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-7">
          <div className="inline-flex items-center gap-2 text-emerald-300 font-medium">
            <CalendarClock className="h-5 w-5" />
            Next mentor session starts Saturday, 8:00 PM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Start Free Today - No Credit Card</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join 2,143 learners this week and build skills that translate into real opportunities.
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
