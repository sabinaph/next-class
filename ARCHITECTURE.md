# NextClass - System Architecture & Integration Guide

## 📐 System Architecture

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Authentication**: NextAuth.js (planned)
- **Payment**: Stripe (planned)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Pages    │  │ Components │  │  Client State    │  │
│  │ (RSC/CSR)  │  │  (UI/UX)   │  │  (React Hooks)   │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────┴─────────────────────────────────┐
│              Next.js Server (App Router)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Server Components (RSC)                │   │
│  │   - Data Fetching  - SEO Optimization            │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │            API Routes (/app/api)                 │   │
│  │   - RESTful Endpoints  - Business Logic          │   │
│  │   - RBAC Guards        - Validation              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Authentication Layer (NextAuth)           │   │
│  │   - Session Management  - Role-Based Access      │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ Prisma ORM
┌───────────────────────┴─────────────────────────────────┐
│                PostgreSQL Database                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Users   │ │ Courses  │ │ Sessions │ │ Bookings │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Payments │ │Waitlists │ │  Certs   │ │  Audits  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 RBAC Implementation Guide

### Current State (Development)

Uses header-based authentication:
```typescript
const userId = request.headers.get('x-user-id');
const userRole = request.headers.get('x-user-role');
```

### Production Implementation

#### Step 1: Install NextAuth

```bash
npm install next-auth @next-auth/prisma-adapter
npm install @types/next-auth --save-dev
```

#### Step 2: Create Auth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.isActive || user.deletedAt) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImage: user.profileImage,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### Step 3: Update NextAuth Types

Create `src/types/next-auth.d.ts`:

```typescript
import { UserRole } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      profileImage?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profileImage?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
```

#### Step 4: Create Auth Middleware

Create `src/middleware.ts`:

```typescript
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/instructor/:path*',
    '/admin/:path*',
    '/api/courses/:path*',
    '/api/bookings/:path*',
  ],
};
```

#### Step 5: Update API Routes

Replace header-based auth with session:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Continue with logic...
}
```

#### Step 6: Create Role-Based Guards

Create `src/lib/auth-guards.ts`:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized');
  }
  
  return session;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

export async function requireInstructor() {
  return requireRole([UserRole.INSTRUCTOR, UserRole.ADMIN]);
}
```

#### Step 7: Usage in Server Components

```typescript
import { requireInstructor } from '@/lib/auth-guards';

export default async function InstructorDashboard() {
  const session = await requireInstructor();
  
  // Render instructor dashboard
  return (
    <div>
      <h1>Welcome, {session.user.firstName}</h1>
    </div>
  );
}
```

---

## 🔄 Module Expansion Guide

### 1. Sessions Module

#### API Routes: `src/app/api/sessions/route.ts`

```typescript
// GET /api/sessions?courseId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  
  const sessions = await prisma.session.findMany({
    where: {
      courseId: courseId || undefined,
      deletedAt: null,
    },
    include: {
      course: true,
      _count: {
        select: { bookings: true }
      }
    }
  });
  
  return NextResponse.json({ success: true, data: sessions });
}

// POST /api/sessions
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const body = await request.json();
  
  const newSession = await prisma.session.create({
    data: {
      courseId: body.courseId,
      title: body.title,
      description: body.description,
      sessionDate: new Date(body.sessionDate),
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      location: body.location,
      meetingLink: body.meetingLink,
      maxStudents: body.maxStudents || 30,
    }
  });
  
  return NextResponse.json({ success: true, data: newSession });
}
```

### 2. Bookings Module

#### API Routes: `src/app/api/bookings/route.ts`

```typescript
// POST /api/bookings
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  // Check session availability
  const sessionWithBookings = await prisma.session.findUnique({
    where: { id: body.sessionId },
    include: {
      _count: { select: { bookings: true } }
    }
  });
  
  if (!sessionWithBookings) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  if (sessionWithBookings._count.bookings >= sessionWithBookings.maxStudents) {
    // Add to waitlist
    await prisma.waitlist.create({
      data: {
        studentId: session.user.id,
        courseId: body.courseId,
        position: await getNextWaitlistPosition(body.courseId),
      }
    });
    
    return NextResponse.json({
      success: false,
      message: 'Session is full. Added to waitlist.'
    });
  }
  
  // Create booking
  const booking = await prisma.booking.create({
    data: {
      studentId: session.user.id,
      courseId: body.courseId,
      sessionId: body.sessionId,
      totalAmount: body.totalAmount,
      status: 'PENDING',
    }
  });
  
  return NextResponse.json({ success: true, data: booking });
}
```

### 3. Payments Module

#### Stripe Integration

```bash
npm install stripe
```

#### API Route: `src/app/api/payments/create-intent/route.ts`

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { bookingId } = await request.json();
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { course: true }
  });
  
  if (!booking || booking.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
  }
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount.toNumber() * 100), // cents
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      studentId: session.user.id,
    },
  });
  
  await prisma.payment.create({
    data: {
      transactionId: paymentIntent.id,
      studentId: session.user.id,
      bookingId: booking.id,
      amount: booking.totalAmount,
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD',
    }
  });
  
  return NextResponse.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
}
```

#### Webhook Handler: `src/app/api/payments/webhook/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Update payment and booking
    await prisma.$transaction([
      prisma.payment.update({
        where: { transactionId: paymentIntent.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        }
      }),
      prisma.booking.update({
        where: { id: paymentIntent.metadata.bookingId },
        data: { status: 'CONFIRMED' }
      }),
    ]);
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 📱 Pages to Implement

### 1. Student Dashboard

**Path**: `src/app/dashboard/page.tsx`

```typescript
import { requireAuth } from '@/lib/auth-guards';

export default async function StudentDashboard() {
  const session = await requireAuth();
  
  const bookings = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    include: {
      course: true,
      session: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return (
    <div>
      <h1>My Dashboard</h1>
      {/* Render bookings */}
    </div>
  );
}
```

### 2. Instructor Dashboard

**Path**: `src/app/instructor/page.tsx`

```typescript
import { requireInstructor } from '@/lib/auth-guards';

export default async function InstructorDashboard() {
  const session = await requireInstructor();
  
  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      _count: { select: { bookings: true, sessions: true } }
    }
  });
  
  return (
    <div>
      <h1>Instructor Dashboard</h1>
      {/* Render courses */}
    </div>
  );
}
```

### 3. Admin Panel

**Path**: `src/app/admin/page.tsx`

```typescript
import { requireAdmin } from '@/lib/auth-guards';

export default async function AdminPanel() {
  await requireAdmin();
  
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.course.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Render stats */}
    </div>
  );
}
```

---

## 📊 Folder Structure (Complete)

```
next-class/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── courses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── sessions/
│   │   │   │   └── route.ts
│   │   │   ├── bookings/
│   │   │   │   └── route.ts
│   │   │   ├── payments/
│   │   │   │   ├── create-intent/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   └── certificates/
│   │   │       └── route.ts
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── instructor/
│   │   │   ├── page.tsx
│   │   │   └── courses/
│   │   │       └── new/
│   │   │           └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   └── auth-guards.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseFilter.tsx
│   │   │   └── CourseDetails.tsx
│   │   ├── bookings/
│   │   │   └── BookingCard.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── types/
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── utils/
│       ├── validators.ts
│       └── formatters.ts
├── .env
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── README.md
├── SETUP.md
└── ARCHITECTURE.md
```

---

## 🧪 Testing Strategy

### Unit Tests

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Integration Tests

Test API routes with supertest:

```bash
npm install --save-dev supertest @types/supertest
```

### E2E Tests

Use Playwright:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

---

## 📈 Performance Optimization

1. **Database Indexes**: Already included in schema
2. **API Caching**: Implement Redis for frequently accessed data
3. **Image Optimization**: Use Next.js Image component
4. **Code Splitting**: Automatic with Next.js
5. **Database Connection Pooling**: Configure Prisma connection pool

---

This architecture provides a solid foundation for building a production-ready course booking system that can scale as requirements grow.
