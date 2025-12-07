# NextClass - Online Course Booking System

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
cd d:/fyp/next-class
npm install
```

### 2. Install Additional Dependencies

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

### 3. Database Setup

#### Create PostgreSQL Database
```sql
CREATE DATABASE nextclass_db;
```

#### Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/nextclass_db?schema=public"
```

### 4. Initialize Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/courses` to see the courses page.

---

## 📁 Project Structure

```
next-class/
├── prisma/
│   ├── schema.prisma          # Database schema with all models
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── courses/
│   │   │       └── route.ts   # API endpoints (GET, POST)
│   │   ├── courses/
│   │   │   └── page.tsx       # Courses listing page
│   │   ├── lib/
│   │   │   └── prisma.ts      # Prisma client instance
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── courses/
│   │       ├── CourseCard.tsx     # Course card component
│   │       └── CourseFilter.tsx   # Filter/search component
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── .env.example
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Core Models

#### User
- Supports 3 roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`
- Email authentication ready
- Soft delete support

#### Course
- Belongs to an instructor
- Multiple sessions per course
- Price, duration, max students
- Published/unpublished status

#### Session
- Scheduled class sessions
- Online or physical location
- Tracks attendance

#### Booking
- Student enrollments
- Multiple statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, etc.
- Linked to payments

#### Waitlist
- Queue system for full courses
- Position tracking
- Notification management

#### Payment
- Multiple payment methods
- Transaction tracking
- Refund support

#### Certificate
- Course completion certificates
- Verification code system

#### Audit
- Full audit trail
- Tracks all system actions

---

## 🔌 API Endpoints

### GET `/api/courses`

Fetch courses with filtering and pagination.

**Query Parameters:**
- `search` - Search in title/description
- `category` - Filter by category
- `level` - Filter by level (Beginner, Intermediate, Advanced)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `instructorId` - Filter by instructor
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Example:**
```bash
GET /api/courses?search=nextjs&category=Web%20Development&page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Full-Stack Web Development with Next.js",
      "description": "...",
      "price": 299.99,
      "instructor": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "_count": {
        "sessions": 2,
        "bookings": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "totalPages": 1
  }
}
```

### POST `/api/courses`

Create a new course (Instructor/Admin only).

**Headers:**
```
x-user-id: <user-id>
x-user-role: INSTRUCTOR
```

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "shortDescription": "Short desc",
  "category": "Web Development",
  "level": "Beginner",
  "price": 199.99,
  "duration": 20,
  "maxStudents": 30,
  "instructorId": "...",
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* course object */ },
  "message": "Course created successfully"
}
```

---

## 🔐 RBAC (Role-Based Access Control)

### Current Implementation (Placeholder)

The API uses header-based authentication for development:
- `x-user-id`: User ID
- `x-user-role`: User role (ADMIN, INSTRUCTOR, STUDENT)

### Production Implementation (TODO)

Replace with **NextAuth.js**:

1. Install NextAuth:
```bash
npm install next-auth @next-auth/prisma-adapter
```

2. Create `src/app/api/auth/[...nextauth]/route.ts`
3. Configure providers (Credentials, Google, GitHub, etc.)
4. Update API routes to use `getServerSession()`

**Example:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check role
  if (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // ... rest of logic
}
```

---

## 🎨 Frontend Components

### CourseFilter (Client Component)
- Search input
- Category dropdown
- Level dropdown
- Price range inputs
- Apply/Reset buttons

### CourseCard (Client Component)
- Course thumbnail
- Title, description
- Instructor info
- Price, duration
- Enrollment count

### CoursesPage (Client Component with Server Data)
- Uses `fetch()` to get data from API
- Loading states
- Error handling
- Empty state
- Pagination

---

## 🧪 Testing the Application

### Test User Credentials

After running `npx prisma db seed`, use these credentials:

**Admin:**
- Email: `admin@nextclass.com`
- Password: `Password123!`

**Instructor 1:**
- Email: `john.doe@nextclass.com`
- Password: `Password123!`

**Instructor 2:**
- Email: `jane.smith@nextclass.com`
- Password: `Password123!`

**Student 1:**
- Email: `student1@example.com`
- Password: `Password123!`

**Student 2:**
- Email: `student2@example.com`
- Password: `Password123!`

### Testing API with curl

**Get courses:**
```bash
curl http://localhost:3000/api/courses
```

**Create course (as instructor):**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "x-user-id: <instructor-id>" \
  -H "x-user-role: INSTRUCTOR" \
  -d '{
    "title": "Test Course",
    "description": "Test description",
    "category": "Web Development",
    "level": "Beginner",
    "price": 99.99,
    "duration": 10,
    "instructorId": "<instructor-id>"
  }'
```

---

## 🚀 Next Steps for Expansion

### 1. Sessions Management
- Create `/app/api/sessions` routes
- Add session booking functionality
- Implement capacity checking

### 2. Booking System
- Create `/app/api/bookings` routes
- Add booking creation and cancellation
- Implement waitlist management

### 3. Payment Integration
- Integrate Stripe or PayPal
- Create `/app/api/payments` routes
- Handle payment webhooks
- Implement refund logic

### 4. Authentication
- Implement NextAuth.js
- Add login/register pages
- Create protected routes
- Add session management

### 5. User Dashboard
- Create `/app/dashboard` for students
- Show enrolled courses
- Display upcoming sessions
- View certificates

### 6. Instructor Portal
- Create `/app/instructor` dashboard
- Manage courses and sessions
- View student enrollments
- Track earnings

### 7. Admin Panel
- Create `/app/admin` dashboard
- User management
- Course approval workflow
- System analytics

### 8. Notifications
- Email notifications (session reminders, booking confirmations)
- In-app notifications
- SMS notifications (optional)

### 9. Certificate Generation
- Auto-generate certificates on course completion
- PDF generation with QR code
- Certificate verification page

### 10. Advanced Features
- Course reviews and ratings
- Discussion forums
- Live video integration (Zoom, Google Meet)
- File uploads for course materials
- Quiz and assessment system

---

## 📊 Database Migrations

### Creating Migrations

When you modify `schema.prisma`:

```bash
npx prisma migrate dev --name description_of_change
```

### View Database

Use Prisma Studio to view your data:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555`

### Reset Database

To reset and reseed:

```bash
npx prisma migrate reset
```

---

## 🔧 Troubleshooting

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### TypeScript Errors
```bash
# Restart TypeScript server in VSCode
# Press Ctrl+Shift+P -> TypeScript: Restart TS Server
```

---

## 📝 License

This project is for educational purposes as part of a Final Year Project.

---

## 👥 Support

For issues or questions about this codebase, please refer to the project documentation or contact the development team.
