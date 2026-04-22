# NextClass - Learning and Digital Resource Marketplace

NextClass is a full-stack learning platform and digital marketplace built with Next.js, TypeScript, PostgreSQL, and Prisma.

It combines course publishing, secure digital access, quizzes, community discussions, role-based dashboards, payments, invoices, and notifications in one system.

## Core Features

### Authentication and Authorization
- NextAuth-based authentication (credentials + OAuth-ready architecture)
- Role-based access control for ADMIN, INSTRUCTOR, and STUDENT
- Session-backed protected routes and APIs
- Password hashing with bcryptjs

### Course and Content Management
- Course creation, editing, publishing, and archival
- Course metadata: category, level, tags, pricing, outcomes, syllabus
- Lesson management by instructors (video, text, PDF, quiz, assignment)
- Course announcements for enrolled learners
- Category and tag organization

### Student Learning Experience
- Browse and search courses
- Multi-filter discovery (category, price, level, instructor)
- Course detail and learning pages
- My courses and profile management
- Lesson progress tracking

### Marketplace, Cart, and Orders
- Add-to-cart and cart management
- Checkout flow
- Order creation and status tracking
- Order items mapped to purchased courses
- Wishlist/save for later

### Payments and Invoicing
- Payment pipeline with gateway metadata support
- Khalti and Stripe integration points in the codebase
- Payment status lifecycle (pending, completed, failed, refunded)
- Invoice generation with invoice numbers and totals

### Downloads and Access Control
- Secure digital access tied to purchases
- Download entitlement tracking
- Download logs (who downloaded what and when)

### Reviews and Feedback
- Course rating and review system
- Instructor replies to student reviews

### Quizzes
- Quiz authoring by instructors/admins
- Multiple question types:
  - Single choice
  - Multiple choice
  - True/false
  - Short answer
- Quiz attempts, answer tracking, and scoring
- Quiz publication workflow

### Community and Engagement
- Community posts (questions/discussions)
- Nested comments and replies
- Reactions on posts and comments
- Solved-state support for discussion threads

### Notifications
- In-app user notifications
- Notification events for community activity and quiz activity
- Read/unread states and notification links
- Email notification extension points

### Admin and Instructor Operations
- Admin panel for users, content, categories, settings, and analytics
- Instructor dashboard for content and course operations
- Instructor application and review workflow
- Revenue/analytics and platform operations modules

### Legacy Course Session and Booking Domain
- Course sessions, bookings, waitlists, payments, certificates, and audit models remain available
- System has transitioned to marketplace-first flows while retaining these entities where needed

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS 4
- Backend: Next.js server actions and API routes
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth + Prisma adapter
- Validation: Zod
- Uploads: UploadThing
- Charts/Analytics UI: Recharts

## Database Domain Overview

Main entities include:
- User, Account, Session, VerificationToken
- Course, Lesson, LessonProgress, Announcement, Review
- CartItem, Order, OrderItem, Invoice, Wishlist
- Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer
- CommunityPost, CommunityComment, CommunityReaction, UserNotification
- Booking, CourseSession, Waitlist, Payment, Certificate, Audit
- InstructorApplication, Category

## Application Areas

Key route groups currently in the app:
- Public pages: home, about, blog, contact, help center, legal pages
- Learning and catalog: courses, learn, my-courses, quizzes, community
- Commerce: cart, checkout, invoices, success, khalti-payment
- Role areas: admin, instructor, profile
- Auth: sign-in/sign-up and auth APIs

## Quick Start

Prerequisites:
- Node.js 18+
- PostgreSQL
- npm or pnpm

Install and run:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed sample data
npx prisma db seed

# Start dev server
npm run dev
```

Open:
- http://localhost:3000

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production build
npm run start

# Lint
npm run lint

# Prisma Studio
npx prisma studio
```

## Documentation

- [SETUP.md](SETUP.md) - setup and environment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - architecture and integration notes
- [AUTHENTICATION.md](AUTHENTICATION.md) - auth implementation details
- [ROLES_AND_PERMISSIONS.md](ROLES_AND_PERMISSIONS.md) - role matrix
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - current module completion
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - command cheatsheet

## License

This project is developed as a final year project and educational platform.
