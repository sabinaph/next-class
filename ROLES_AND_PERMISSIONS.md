# Roles & Permissions Documentation

This document defines the roles, responsibilities, and permissions
for the Course Booking & Learning Platform.

Roles:
- Admin
- Instructor
- Student

---

## 1. Admin Role

### Overview
The **Admin** is the highest authority in the system.  
Admins manage users, instructors, courses, bookings, system settings,
and platform-wide rules.

Admins **create Instructor accounts directly** (no email verification).

---

### Admin Permissions

#### Authentication & Access
- Login via Credentials (NextAuth.js)
- No self-registration
- Role-based access control (RBAC)

---

#### Instructor Management
- Create Instructor accounts (username, email, password)
- Assign role = INSTRUCTOR
- Email verification NOT required
- Edit Instructor profiles
- Reset Instructor passwords
- Activate / deactivate Instructor accounts
- View Instructor activity
- Assign Instructors to courses

---

#### Student Management
- View all students
- Activate / deactivate students
- Reset student passwords
- View student enrollments and progress

---

#### Course Management
- View all courses
- Approve / reject courses
- Edit or delete any course
- Assign instructors to courses
- Manage categories, tags, and levels
- Archive or feature courses

---

#### Booking & Schedule Control
- View all bookings
- Override slot availability
- Cancel or reschedule any booking
- Set global booking rules:
  - Max students per slot
  - Cancellation deadlines
  - Reschedule limits

---

#### Dashboard & Analytics
- Total users (by role)
- Course and instructor performance
- Booking trends
- Completion rates
- Certificate statistics
- Wishlist trends

---

#### Certificates
- Create certificate templates
- Define completion criteria
- Revoke or reissue certificates
- View certificate audit logs

---

#### Discussion & Moderation
- Moderate all discussions and Q&A
- Remove posts or comments
- Ban users from discussions
- Handle reported content

---

#### Email & Notifications
- Configure email templates
- Send platform-wide announcements
- Monitor email delivery logs

---

#### Security & System Settings
- View audit logs
- Monitor suspicious activity
- Enable / disable platform features
- Maintenance mode
- Data export and compliance controls

---

### Admin Restrictions
- Cannot enroll as a student
- Cannot teach courses (unless also assigned Instructor role)

---

## 2. Instructor Role

### Overview
The **Instructor** is responsible for teaching and managing courses.
Instructor accounts are created by Admins and are active immediately.

---

### Instructor Permissions

#### Course Management
- Create and manage own courses
- Upload lessons (video, text, PDF)
- Update or archive courses
- Manage course content

---

#### Scheduling & Slots
- Create available time slots
- Manage session schedules
- View booking status
- Request reschedule or cancellation

---

#### Student Management
- View enrolled students
- Track student progress
- View attendance
- Communicate with students

---

#### Dashboard
- Active courses
- Upcoming sessions
- Enrollments
- Student progress analytics

---

#### Discussion & Engagement
- Answer questions in forums
- Participate in course discussions
- Pin important announcements

---

#### Feedback & Ratings
- View course ratings and reviews
- Respond to student feedback

---

#### Certificates
- Trigger course completion certificates
- Validate completion criteria

---

### Instructor Restrictions
- Cannot create users or instructors
- Cannot change system settings
- Cannot access other instructors’ data

---

## 3. Student Role

### Overview
The **Student** is the learner who discovers, books, attends,
and completes courses.

Students self-register and must verify their email.

---

### Student Permissions

#### Registration & Authentication
- Self-registration
- Email verification required
- Login via NextAuth.js
- Password reset

---

#### Course Discovery
- Browse courses by:
  - Date
  - Instructor
  - Category
- View course details
- Save courses to Wishlist

---

#### Booking & Enrollment
- Book course slots
- Real-time availability checking
- Reschedule bookings (within rules)
- Cancel bookings (before deadline)

---

#### Learning & Progress
- Access enrolled courses
- View lessons
- Mark lessons as completed
- Track learning progress
- Resume learning anytime

---

#### Discussion & Q&A
- Ask questions in enrolled courses
- Reply to discussions
- Report inappropriate content

---

#### Ratings & Feedback
- Rate completed courses
- Leave course feedback

---

#### Certificates
- Receive auto-generated completion certificates
- Download or share certificates

---

#### Student Dashboard
- Enrolled courses
- Upcoming sessions
- Progress overview
- Certificates earned
- Wishlist items

---

### Student Restrictions
- Cannot create or manage courses
- Cannot manage users
- Cannot access admin or instructor dashboards

---

## Role Summary Table

| Feature | Student | Instructor | Admin |
|------|--------|-----------|-------|
| Self Registration | Yes | No | No |
| Teach Courses | No | Yes | No |
| Create Instructors | No | No | Yes |
| Book Courses | Yes | No | No |
| Manage All Courses | No | No | Yes |
| System Settings | No | No | Yes |

---

## End of Document
