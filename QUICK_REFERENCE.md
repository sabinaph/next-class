# NextClass - Quick Reference Card

## 🚀 Getting Started (5 minutes)

```bash
# 1. Setup
npm install
npx prisma generate

# 2. Database (update DATABASE_URL in .env first!)
npx prisma migrate dev --name init
npx prisma db seed

# 3. Run
npm run dev
```

**Visit**: http://localhost:3000/courses

---

## 📡 API Quick Reference

### Get Courses
```bash
GET /api/courses
GET /api/courses?search=nextjs
GET /api/courses?category=Web%20Development&level=Beginner
GET /api/courses?minPrice=100&maxPrice=500
GET /api/courses?page=2&limit=12
```

### Create Course
```bash
POST /api/courses
Headers:
  x-user-id: <instructor-id>
  x-user-role: INSTRUCTOR
  Content-Type: application/json
Body:
{
  "title": "My Course",
  "description": "Description here...",
  "category": "Web Development",
  "level": "Beginner",
  "price": 199.99,
  "duration": 20,
  "instructorId": "<instructor-id>"
}
```

---

## 🔑 Test Credentials

**After running `npx prisma db seed`:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nextclass.com | Password123! |
| Instructor | john.doe@nextclass.com | Password123! |
| Instructor | jane.smith@nextclass.com | Password123! |
| Student | student1@example.com | Password123! |
| Student | student2@example.com | Password123! |

---

## 🗄️ Database Commands

```bash
# View data in GUI
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Format schema
npx prisma format
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models |
| `src/types/index.ts` | TypeScript types |
| `src/app/api/courses/route.ts` | Course API |
| `src/app/courses/page.tsx` | Courses page |
| `src/components/courses/CourseFilter.tsx` | Filter UI |
| `src/components/courses/CourseCard.tsx` | Course card |
| `.env` | Environment config |

---

## 🎨 Component Usage

### CourseFilter
```tsx
<CourseFilter 
  onFilterChange={(filters) => console.log(filters)}
  isLoading={false}
/>
```

### CourseCard
```tsx
<CourseCard course={courseData} />
```

---

## 🔧 Common Issues

### Prisma Client not found
```bash
npx prisma generate
```

### Database connection failed
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### Port 3000 already in use
```bash
npx kill-port 3000
# OR
npm run dev -- -p 3001
```

### TypeScript errors
```
Ctrl+Shift+P -> TypeScript: Restart TS Server
```

---

## 📊 Sample Queries

### Get instructor's courses
```typescript
const courses = await prisma.course.findMany({
  where: { instructorId: userId },
  include: { instructor: true }
});
```

### Get student's bookings
```typescript
const bookings = await prisma.booking.findMany({
  where: { studentId: userId },
  include: {
    course: true,
    session: true,
    payments: true,
  }
});
```

### Create booking
```typescript
const booking = await prisma.booking.create({
  data: {
    studentId: userId,
    courseId: courseId,
    sessionId: sessionId,
    totalAmount: 299.99,
    status: 'PENDING',
  }
});
```

---

## 🛣️ Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/courses` | Browse courses |
| `/courses/[id]` | Course details (TODO) |
| `/dashboard` | Student dashboard (TODO) |
| `/instructor` | Instructor dashboard (TODO) |
| `/admin` | Admin panel (TODO) |
| `/api/courses` | Course API |

---

## 🎯 Filter Options

### Categories
- Web Development
- Mobile Development
- Data Science
- Machine Learning
- UI/UX Design
- Business
- Marketing
- Photography
- Music

### Levels
- Beginner
- Intermediate
- Advanced

### User Roles
- ADMIN
- INSTRUCTOR
- STUDENT

---

## 💻 Development Tips

1. **Use Prisma Studio** for quick database viewing:
   ```bash
   npx prisma studio
   ```

2. **Format your schema** regularly:
   ```bash
   npx prisma format
   ```

3. **Check database sync**:
   ```bash
   npx prisma migrate status
   ```

4. **Hot reload** works automatically with Next.js

5. **Check errors** in browser console and terminal

---

## 📦 Dependencies

### Production
- next
- react
- react-dom
- @prisma/client
- bcryptjs

### Development
- typescript
- @types/node
- @types/react
- @types/react-dom
- @types/bcryptjs
- prisma
- tailwindcss
- eslint
- ts-node

---

## 🚀 Deployment Checklist

- [ ] Update DATABASE_URL for production
- [ ] Set NEXTAUTH_SECRET
- [ ] Run `npm run build` successfully
- [ ] Test all API endpoints
- [ ] Run database migrations
- [ ] Seed production data (if needed)
- [ ] Set up environment variables
- [ ] Configure domain/DNS
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring

---

## 📚 Documentation

- **SETUP.md** - Complete setup guide
- **ARCHITECTURE.md** - System architecture
- **IMPLEMENTATION.md** - What was built
- **QUICK_REFERENCE.md** - This file

---

## 🎓 Next Feature: Authentication

To add NextAuth:

```bash
npm install next-auth @next-auth/prisma-adapter
```

Create `src/app/api/auth/[...nextauth]/route.ts` (see ARCHITECTURE.md)

---

## ⚡ Performance Tips

1. Add indexes to frequently queried fields (already done)
2. Use `select` to limit returned fields
3. Use `include` wisely
4. Implement caching for static data
5. Optimize images with Next.js Image

---

## 🎨 UI Components Status

| Component | Status | File |
|-----------|--------|------|
| CourseFilter | ✅ Done | CourseFilter.tsx |
| CourseCard | ✅ Done | CourseCard.tsx |
| Header | ⏳ TODO | - |
| Footer | ⏳ TODO | - |
| BookingCard | ⏳ TODO | - |
| SessionCard | ⏳ TODO | - |

---

## 📝 API Status

| Endpoint | Status |
|----------|--------|
| GET /api/courses | ✅ Done |
| POST /api/courses | ✅ Done |
| GET /api/courses/[id] | ⏳ TODO |
| PUT /api/courses/[id] | ⏳ TODO |
| DELETE /api/courses/[id] | ⏳ TODO |
| GET /api/sessions | ⏳ TODO |
| POST /api/sessions | ⏳ TODO |
| GET /api/bookings | ⏳ TODO |
| POST /api/bookings | ⏳ TODO |

---

**For detailed information, see SETUP.md and ARCHITECTURE.md**

Happy coding! 🚀
