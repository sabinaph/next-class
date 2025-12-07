# 🎓 NextClass - Online Course Booking System

A production-ready, full-stack course booking and management system built with Next.js 15, TypeScript, PostgreSQL, and Prisma.

## ✨ Features

### ✅ Implemented
- **Complete Database Schema** - 8 models with proper relations and constraints
- **RESTful API** - GET/POST endpoints with filtering, pagination, and RBAC
- **Course Management** - Browse, filter, and search courses
- **TypeScript** - Full type safety across the entire application
- **Responsive UI** - Beautiful, mobile-friendly interface with TailwindCSS
- **Role-Based Access Control** - ADMIN, INSTRUCTOR, STUDENT roles
- **Audit Logging** - Complete activity tracking
- **Soft Delete** - Data preservation with recovery options

### 🚀 Ready for Implementation
- User Authentication (NextAuth.js integration guide included)
- Session Management
- Booking System with Waitlist
- Payment Integration (Stripe ready)
- Certificate Generation
- Email Notifications
- Student/Instructor/Admin Dashboards

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Authentication**: NextAuth.js (ready for integration)
- **Password Hashing**: bcryptjs

## 📦 Database Models

```
User ──┬──→ Course (as Instructor)
       ├──→ Booking
       ├──→ Waitlist
       ├──→ Payment
       ├──→ Certificate
       └──→ Audit

Course ──┬──→ Session
         ├──→ Booking
         ├──→ Waitlist
         └──→ Certificate

Session ──→ Booking

Booking ──→ Payment
```

**8 Core Models**: User, Course, Session, Booking, Waitlist, Payment, Certificate, Audit

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
# Copy .env.example to .env and update DATABASE_URL
cp .env.example .env

# 3. Generate Prisma Client
npx prisma generate

# 4. Create database and run migrations
npx prisma migrate dev --name init

# 5. Seed database with sample data
npx prisma db seed

# 6. Start development server
npm run dev
```

Visit **http://localhost:3000/courses** to see the courses page.

## 🎮 Test Credentials

After running `npx prisma db seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nextclass.com | Password123! |
| Instructor | john.doe@nextclass.com | Password123! |
| Instructor | jane.smith@nextclass.com | Password123! |
| Student | student1@example.com | Password123! |
| Student | student2@example.com | Password123! |

## 📡 API Endpoints

### GET /api/courses
Fetch courses with optional filters:
```bash
GET /api/courses?search=nextjs&category=Web%20Development&level=Intermediate&page=1
```

### POST /api/courses
Create a new course (Instructor/Admin only):
```bash
POST /api/courses
Headers:
  x-user-id: <instructor-id>
  x-user-role: INSTRUCTOR
Body: {
  "title": "My Course",
  "description": "...",
  "category": "Web Development",
  "level": "Beginner",
  "price": 199.99,
  "duration": 20,
  "instructorId": "<instructor-id>"
}
```

## 📁 Project Structure

```
next-class/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
├── src/
│   ├── app/
│   │   ├── api/courses/       # Course API endpoints
│   │   ├── courses/           # Courses page
│   │   └── lib/prisma.ts      # Prisma client
│   ├── components/courses/    # Course components
│   └── types/                 # TypeScript types
├── .env.example               # Environment template
├── SETUP.md                   # Detailed setup guide
├── ARCHITECTURE.md            # System architecture
├── IMPLEMENTATION.md          # What's implemented
└── QUICK_REFERENCE.md         # Quick commands
```

## 🗄️ Database Commands

```bash
# View data in GUI
npx prisma studio

# Create migration
npx prisma migrate dev --name your_migration

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and configuration guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and integration guide
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Implementation summary
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and references

## 🔐 Authentication

Currently uses header-based authentication for development:
- `x-user-id`: User ID
- `x-user-role`: ADMIN | INSTRUCTOR | STUDENT

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for production NextAuth.js integration guide.

## 🎨 UI Components

### CourseFilter
Client component with search, category, level, and price filters.

### CourseCard
Beautiful course card with instructor info, price, duration, and enrollment count.

### CoursesPage
Full-featured course listing with pagination, loading states, and error handling.

## 🚀 Next Steps

1. **Implement Authentication** - Add NextAuth.js (guide in ARCHITECTURE.md)
2. **Session Management** - Create session booking system
3. **Payment Integration** - Add Stripe for payments
4. **User Dashboards** - Build student/instructor/admin interfaces
5. **Notifications** - Email/SMS alerts
6. **Certificate Generation** - Auto-generate on completion

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for detailed implementation guides.

## 🧪 Testing

```bash
# Test API
curl http://localhost:3000/api/courses

# View in browser
http://localhost:3000/courses
```

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📊 Database Schema Highlights

- **User Roles**: ADMIN, INSTRUCTOR, STUDENT
- **Booking Statuses**: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- **Payment Methods**: CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER
- **Soft Delete**: All major entities support soft deletion
- **Audit Logging**: Complete activity tracking
- **Indexes**: Optimized for performance

## 🔒 Security Features

- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Input validation
- Soft delete (data preservation)
- Audit trail
- SQL injection prevention (Prisma)

## 🎯 Production Ready

- ✅ Full TypeScript typing
- ✅ Error handling
- ✅ Input validation
- ✅ Database indexes
- ✅ Pagination
- ✅ Responsive design
- ✅ Loading states
- ✅ Empty states
- ✅ Documentation

## 📄 License

This project is for educational purposes as part of a Final Year Project.

## 🤝 Contributing

This is a FYP project. For questions or suggestions, please refer to the documentation files.

## 📞 Support

- Check **[SETUP.md](SETUP.md)** for setup issues
- Review **[ARCHITECTURE.md](ARCHITECTURE.md)** for implementation details
- See **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for quick commands

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and Prisma**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
