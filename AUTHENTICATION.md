# Authentication Setup Guide

## ✅ Completed Implementation

### 1. NextAuth.js Integration

**Installed Packages:**
- `next-auth` - Authentication library for Next.js
- `@auth/prisma-adapter` - Prisma adapter for NextAuth

### 2. Database Schema Updates

**Added NextAuth Models:**
- `Account` - OAuth provider accounts
- `Session` - User sessions (renamed course sessions to `CourseSession`)
- `VerificationToken` - Email verification tokens

**Updated User Model:**
- Added `name`, `image`, `emailVerified` fields for NextAuth compatibility
- Made `passwordHash` optional (for OAuth users)
- Made `firstName`, `lastName` optional

### 3. Authentication Pages

#### Sign In Page (`/auth/signin`)
- ✅ Email/password login
- ✅ Google OAuth sign-in
- ✅ "Forgot password" link
- ✅ Link to signup page
- ✅ Beautiful design matching Mastery Hub style
- ✅ Error handling and loading states

#### Sign Up Page (`/auth/signup`)
- ✅ Registration form (first name, last name, email, password)
- ✅ Password confirmation validation
- ✅ Google OAuth sign-up
- ✅ Auto sign-in after registration
- ✅ Link to signin page
- ✅ Matching design with signin page

### 4. API Endpoints

#### `/api/auth/[...nextauth]`
- ✅ NextAuth configuration
- ✅ Google OAuth provider
- ✅ Credentials provider (email/password)
- ✅ JWT callbacks
- ✅ Session callbacks
- ✅ Custom sign-in logic

#### `/api/auth/register`
- ✅ User registration endpoint
- ✅ Password hashing with bcryptjs
- ✅ Email validation
- ✅ Duplicate check
- ✅ Audit log creation

### 5. Session Management

- ✅ SessionProvider wrapper component
- ✅ Added to root layout
- ✅ Client-side session access

---

## 🚀 Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials"
5. Create "OAuth 2.0 Client ID"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### 3. Database Migration

Run the migration to add NextAuth tables:

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name add_nextauth

# Or reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### 4. Update Seed Script

The seed script needs to be updated to work with the new User schema. The changes have been made to make `passwordHash`, `firstName`, and `lastName` optional.

---

## 📱 Usage

### Access Authentication Pages

- **Sign In**: http://localhost:3000/auth/signin
- **Sign Up**: http://localhost:3000/auth/signup

### Use Session in Components

#### Client Components:

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

#### Server Components:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}
```

### Protect API Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check role
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Your API logic here
}
```

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ JWT-based sessions
- ✅ OAuth 2.0 with Google
- ✅ CSRF protection (built-in with NextAuth)
- ✅ Secure cookies
- ✅ Role-based access control
- ✅ Audit logging

---

## 🎨 Design Features

Both signin and signup pages feature:
- ✅ Split-screen layout (illustration left, form right)
- ✅ Beautiful SVG illustration
- ✅ Green color scheme matching NextClass branding
- ✅ Responsive design (mobile-friendly)
- ✅ Google sign-in button with official colors
- ✅ Form validation and error handling
- ✅ Loading states
- ✅ Clean, modern UI

---

## 🔧 Customization

### Change Colors

Update Tailwind classes in:
- `/app/auth/signin/page.tsx`
- `/app/auth/signup/page.tsx`

Main colors used:
- Green: `green-50`, `green-600`, `green-700`
- Gray: `gray-800`, `gray-900`

### Add More OAuth Providers

In `/app/api/auth/[...nextauth]/route.ts`:

```typescript
import GitHubProvider from 'next-auth/providers/github';

providers: [
  GoogleProvider({ /* ... */ }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
],
```

### Custom Sign-In Page

The sign-in page is already customized! To modify:
- Edit `/app/auth/signin/page.tsx`
- Update the illustration SVG
- Modify the form fields
- Change colors and styling

---

## 🧪 Testing

### Test User Registration

1. Go to http://localhost:3000/auth/signup
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Password123!
3. Click "Create Account"
4. You should be automatically signed in

### Test Sign In

1. Go to http://localhost:3000/auth/signin
2. Enter email and password
3. Click "Sign In"

### Test Google OAuth

1. Click "Sign in with Google" button
2. Select Google account
3. Authorize the app
4. You should be redirected to /courses

---

## 📊 Database Changes

### New Tables

- `accounts` - OAuth provider accounts
- `sessions` - NextAuth sessions
- `verification_tokens` - Email verification

### Renamed Table

- `sessions` → `course_sessions` (to avoid conflict with NextAuth)

### Updated User Table

Added fields for NextAuth:
- `name` (optional)
- `image` (optional)
- `emailVerified` (DateTime, optional)

Made optional:
- `passwordHash` (for OAuth users)
- `firstName` (can use `name` instead)
- `lastName` (can use `name` instead)

---

## 🚀 Next Steps

1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement password reset functionality
3. **Two-Factor Auth**: Add 2FA for extra security
4. **Social Providers**: Add GitHub, Facebook, etc.
5. **Profile Management**: User profile editing
6. **Account Settings**: Change password, delete account

---

## 📝 Files Modified/Created

### Created:
1. `/app/auth/signin/page.tsx` - Sign in page
2. `/app/auth/signup/page.tsx` - Sign up page
3. `/app/api/auth/[...nextauth]/route.ts` - NextAuth config
4. `/app/api/auth/register/route.ts` - Registration endpoint
5. `/components/SessionProvider.tsx` - Session wrapper
6. `/types/next-auth.d.ts` - NextAuth TypeScript types

### Modified:
1. `prisma/schema.prisma` - Added NextAuth models
2. `src/app/layout.tsx` - Added SessionProvider
3. `.env.example` - Added Google OAuth variables
4. `package.json` - Added next-auth dependencies

---

## ✨ Features Summary

✅ Email/password authentication
✅ Google OAuth sign-in
✅ User registration
✅ Session management
✅ Role-based access control
✅ Beautiful, responsive UI
✅ Audit logging
✅ Type-safe with TypeScript
✅ Production-ready code

---

**All authentication features are now ready to use!** 🎉
