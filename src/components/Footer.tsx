import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 py-12 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/NEXTCLASS.png"
                alt="NextClass Logo"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Next<span className="text-green-600">Class</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Empowering students and educators with next-generation learning
              tools. Join the future of education today.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/courses"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Browse Courses
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Mentorship
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  For Instructors
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} NextClass Hub. All rights
            reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social Placeholders */}
            <a
              href="#"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
