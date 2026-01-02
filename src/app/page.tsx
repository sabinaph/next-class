"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-8 animate-in slide-in-from-left-5 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold border border-green-200 dark:border-green-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  New Courses Available
                </div>
                <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                  Unleash Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                    Academic Success
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                  Join thousands of students on NextClass Hub. Master new
                  skills, connect with expert mentors, and achieve your learning
                  goals with our premium course platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/courses"
                    className="inline-flex justify-center items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-xl shadow-gray-900/10 dark:shadow-white/10 hover:-translate-y-0.5"
                  >
                    Browse Courses
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex justify-center items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    Start for Free
                    <ArrowRight className="ml-2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400"
                      >
                        ?
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 2,000+ students</p>
                </div>
              </div>

              {/* Illustration / Image */}
              <div className="relative animate-in slide-in-from-right-5 duration-1000">
                <div className="relative z-10 bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 transform rotate-2 hover:rotate-0 transition duration-500">
                  <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-950/40 rounded-2xl h-[400px] w-full flex items-center justify-center overflow-hidden">
                    {/* SVG Illustration similar to sign in but adapted */}
                    <svg
                      className="w-full h-full p-8"
                      viewBox="0 0 400 400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Background Elements */}
                      <circle
                        cx="200"
                        cy="200"
                        r="150"
                        fill="white"
                        fillOpacity="0.5"
                      />
                      <circle
                        cx="200"
                        cy="200"
                        r="100"
                        fill="white"
                        fillOpacity="0.7"
                      />

                      {/* Character/Focus */}
                      <defs>
                        <linearGradient
                          id="screenGrad"
                          x1="150"
                          y1="150"
                          x2="250"
                          y2="250"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#34D399" />
                          <stop offset="1" stopColor="#059669" />
                        </linearGradient>
                      </defs>

                      <rect
                        x="100"
                        y="100"
                        width="200"
                        height="150"
                        rx="12"
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth="4"
                      />
                      <rect
                        x="115"
                        y="115"
                        width="170"
                        height="100"
                        rx="4"
                        fill="#F3F4F6"
                      />

                      {/* Graphs on screen */}
                      <path
                        d="M115 215 L115 115 L285 115 L285 215"
                        stroke="none"
                        fill="#F9FAFB"
                      />
                      <path
                        d="M125 190 L160 160 L190 180 L230 140 L275 130"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="160" cy="160" r="4" fill="#10B981" />
                      <circle cx="230" cy="140" r="4" fill="#10B981" />

                      {/* Floating Person Head */}
                      <circle cx="200" cy="300" r="40" fill="#FCA5A5" />
                      <path d="M160 300 Q200 380 240 300" fill="#1F2937" />

                      {/* Hands typing */}
                      <ellipse
                        cx="140"
                        cy="280"
                        rx="20"
                        ry="15"
                        fill="#FCA5A5"
                      />
                      <ellipse
                        cx="260"
                        cy="280"
                        rx="20"
                        ry="15"
                        fill="#FCA5A5"
                      />

                      {/* Decoration */}
                      <path
                        d="M50 80 L70 60 M70 80 L50 60"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="340"
                        cy="340"
                        r="15"
                        stroke="#6366F1"
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 right-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Why Choose NextClass Hub?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We provide the tools and resources you need to excel in your
                studies and career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BookOpen className="w-8 h-8 text-white" />,
                  title: "Expert-Led Courses",
                  desc: "Learn from industry professionals and experienced educators.",
                  color: "bg-blue-600",
                },
                {
                  icon: <Users className="w-8 h-8 text-white" />,
                  title: "Interactive Community",
                  desc: "Connect with peers, mentors, and build your network.",
                  color: "bg-green-600",
                },
                {
                  icon: <Award className="w-8 h-8 text-white" />,
                  title: "Certified Learning",
                  desc: "Earn certificates upon completion to showcase your skills.",
                  color: "bg-purple-600",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition duration-300 hover:-translate-y-1 group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg ${feature.color} group-hover:scale-110 transition`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join NextClass Hub today and get unlimited access to our top-rated
              courses.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-xl transition shadow-lg shadow-green-900/50 hover:shadow-green-500/50"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
