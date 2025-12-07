import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define UserRole locally for seed script
enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (be careful with this in production!)
  console.log('🧹 Cleaning existing data...');
  await prisma.audit.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.session.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nextclass.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneNumber: '+1234567890',
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: 'john.doe@nextclass.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
      phoneNumber: '+1234567891',
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'jane.smith@nextclass.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
      phoneNumber: '+1234567892',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      passwordHash: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.STUDENT,
      emailVerified: true,
      phoneNumber: '+1234567893',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Williams',
      role: UserRole.STUDENT,
      emailVerified: true,
      phoneNumber: '+1234567894',
    },
  });

  console.log(`✅ Created ${5} users`);

  // Create Courses
  console.log('📚 Creating courses...');

  const course1 = await prisma.course.create({
    data: {
      title: 'Full-Stack Web Development with Next.js',
      description:
        'Learn to build modern, full-stack web applications using Next.js 14, React, TypeScript, and PostgreSQL. This comprehensive course covers everything from basic concepts to advanced topics like server components, API routes, authentication, and deployment.',
      shortDescription:
        'Master Next.js 14 and build production-ready full-stack applications',
      category: 'Web Development',
      level: 'Intermediate',
      price: 299.99,
      duration: 40,
      maxStudents: 30,
      instructorId: instructor1.id,
      prerequisites:
        'Basic knowledge of JavaScript, React, and HTML/CSS. Familiarity with Node.js is helpful but not required.',
      learningOutcomes: JSON.stringify([
        'Build full-stack applications with Next.js 14 App Router',
        'Implement server and client components effectively',
        'Create RESTful APIs with Next.js API routes',
        'Integrate PostgreSQL with Prisma ORM',
        'Implement authentication and authorization',
        'Deploy applications to production',
      ]),
      syllabus: JSON.stringify([
        { week: 1, topic: 'Introduction to Next.js and Setup' },
        { week: 2, topic: 'React Server Components' },
        { week: 3, topic: 'Routing and Navigation' },
        { week: 4, topic: 'API Routes and Data Fetching' },
        { week: 5, topic: 'Database Integration with Prisma' },
        { week: 6, topic: 'Authentication with NextAuth' },
        { week: 7, topic: 'Advanced Patterns and Optimization' },
        { week: 8, topic: 'Deployment and Production Best Practices' },
      ]),
      isPublished: true,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Data Science and Machine Learning with Python',
      description:
        'Dive into the world of data science and machine learning. Learn Python programming, data analysis with pandas, data visualization, and build machine learning models using scikit-learn and TensorFlow.',
      shortDescription: 'Learn data science, analytics, and machine learning from scratch',
      category: 'Data Science',
      level: 'Beginner',
      price: 249.99,
      duration: 50,
      maxStudents: 40,
      instructorId: instructor2.id,
      prerequisites:
        'Basic programming knowledge is helpful. No prior experience with Python or data science required.',
      learningOutcomes: JSON.stringify([
        'Master Python programming fundamentals',
        'Perform data analysis with pandas and NumPy',
        'Create compelling visualizations with Matplotlib and Seaborn',
        'Build machine learning models',
        'Understand supervised and unsupervised learning',
        'Deploy ML models to production',
      ]),
      syllabus: JSON.stringify([
        { week: 1, topic: 'Python Fundamentals' },
        { week: 2, topic: 'NumPy and Data Structures' },
        { week: 3, topic: 'Pandas for Data Analysis' },
        { week: 4, topic: 'Data Visualization' },
        { week: 5, topic: 'Introduction to Machine Learning' },
        { week: 6, topic: 'Supervised Learning Algorithms' },
        { week: 7, topic: 'Unsupervised Learning' },
        { week: 8, topic: 'Deep Learning with TensorFlow' },
        { week: 9, topic: 'Model Evaluation and Optimization' },
        { week: 10, topic: 'ML Model Deployment' },
      ]),
      isPublished: true,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced UI/UX Design Principles',
      description:
        'Master the art of user interface and user experience design. Learn design thinking, wireframing, prototyping, and how to create beautiful, user-friendly interfaces using industry-standard tools like Figma.',
      shortDescription: 'Create stunning, user-centered designs with modern tools',
      category: 'UI/UX Design',
      level: 'Advanced',
      price: 199.99,
      duration: 30,
      maxStudents: 25,
      instructorId: instructor1.id,
      prerequisites:
        'Basic understanding of design principles. Experience with any design tool is helpful.',
      learningOutcomes: JSON.stringify([
        'Apply design thinking methodology',
        'Create user personas and journey maps',
        'Design wireframes and mockups',
        'Build interactive prototypes in Figma',
        'Conduct usability testing',
        'Implement accessibility best practices',
      ]),
      syllabus: JSON.stringify([
        { week: 1, topic: 'Design Thinking Fundamentals' },
        { week: 2, topic: 'User Research Methods' },
        { week: 3, topic: 'Information Architecture' },
        { week: 4, topic: 'Wireframing and Low-Fidelity Prototyping' },
        { week: 5, topic: 'Visual Design Principles' },
        { week: 6, topic: 'High-Fidelity Design in Figma' },
        { week: 7, topic: 'Interaction Design and Animations' },
        { week: 8, topic: 'Usability Testing and Iteration' },
      ]),
      isPublished: true,
    },
  });

  // Create unpublished course
  await prisma.course.create({
    data: {
      title: 'Mobile App Development with React Native',
      description:
        'Build cross-platform mobile applications for iOS and Android using React Native. Learn to create native mobile experiences using JavaScript and React.',
      shortDescription: 'Build iOS and Android apps with React Native',
      category: 'Mobile Development',
      level: 'Intermediate',
      price: 279.99,
      duration: 35,
      maxStudents: 30,
      instructorId: instructor2.id,
      prerequisites: 'Good understanding of JavaScript and React. Basic mobile development concepts.',
      learningOutcomes: JSON.stringify([
        'Build cross-platform mobile apps',
        'Work with React Native components',
        'Integrate native device features',
        'Handle state management in mobile apps',
        'Publish apps to App Store and Google Play',
      ]),
      isPublished: false, // This one is not published yet
    },
  });

  console.log(`✅ Created ${4} courses`);

  // Create Sessions for courses
  console.log('🗓️  Creating sessions...');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.session.createMany({
    data: [
      {
        courseId: course1.id,
        title: 'Introduction to Next.js - Session 1',
        description: 'Get started with Next.js 14 and the App Router',
        sessionDate: nextWeek,
        startTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        location: 'Online',
        meetingLink: 'https://zoom.us/j/example1',
        maxStudents: 30,
        status: 'SCHEDULED',
      },
      {
        courseId: course1.id,
        title: 'React Server Components - Session 2',
        description: 'Deep dive into React Server Components',
        sessionDate: twoWeeks,
        startTime: new Date(twoWeeks.setHours(10, 0, 0, 0)),
        endTime: new Date(twoWeeks.setHours(12, 0, 0, 0)),
        location: 'Online',
        meetingLink: 'https://zoom.us/j/example2',
        maxStudents: 30,
        status: 'SCHEDULED',
      },
      {
        courseId: course2.id,
        title: 'Python Basics - Session 1',
        description: 'Introduction to Python programming',
        sessionDate: nextWeek,
        startTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(16, 0, 0, 0)),
        location: 'Online',
        meetingLink: 'https://zoom.us/j/example3',
        maxStudents: 40,
        status: 'SCHEDULED',
      },
      {
        courseId: course3.id,
        title: 'Design Thinking Workshop',
        description: 'Hands-on design thinking workshop',
        sessionDate: nextWeek,
        startTime: new Date(nextWeek.setHours(16, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(18, 0, 0, 0)),
        location: 'Room 301, Building A',
        maxStudents: 25,
        status: 'SCHEDULED',
      },
    ],
  });

  console.log(`✅ Created sessions`);

  // Create sample bookings
  console.log('🎫 Creating bookings...');

  const sessions = await prisma.session.findMany();

  const booking1 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      sessionId: sessions[0].id,
      status: 'CONFIRMED',
      numberOfSeats: 1,
      totalAmount: 299.99,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      studentId: student2.id,
      courseId: course2.id,
      sessionId: sessions[2].id,
      status: 'CONFIRMED',
      numberOfSeats: 1,
      totalAmount: 249.99,
    },
  });

  console.log(`✅ Created ${2} bookings`);

  // Create sample payments
  console.log('💳 Creating payments...');

  await prisma.payment.createMany({
    data: [
      {
        transactionId: `TXN-${Date.now()}-001`,
        studentId: student1.id,
        bookingId: booking1.id,
        amount: 299.99,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        paidAt: new Date(),
      },
      {
        transactionId: `TXN-${Date.now()}-002`,
        studentId: student2.id,
        bookingId: booking2.id,
        amount: 249.99,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        paidAt: new Date(),
      },
    ],
  });

  console.log(`✅ Created ${2} payments`);

  // Create audit logs
  console.log('📋 Creating audit logs...');

  await prisma.audit.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE',
        entityType: 'Course',
        entityId: course1.id,
        metadata: { courseTitle: course1.title },
        timestamp: new Date(),
      },
      {
        userId: student1.id,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: booking1.id,
        metadata: { courseId: course1.id },
        timestamp: new Date(),
      },
    ],
  });

  console.log(`✅ Created audit logs`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('-------------------');
  console.log('Admin:');
  console.log('  Email: admin@nextclass.com');
  console.log('  Password: Password123!');
  console.log('');
  console.log('Instructor 1:');
  console.log('  Email: john.doe@nextclass.com');
  console.log('  Password: Password123!');
  console.log('');
  console.log('Instructor 2:');
  console.log('  Email: jane.smith@nextclass.com');
  console.log('  Password: Password123!');
  console.log('');
  console.log('Student 1:');
  console.log('  Email: student1@example.com');
  console.log('  Password: Password123!');
  console.log('');
  console.log('Student 2:');
  console.log('  Email: student2@example.com');
  console.log('  Password: Password123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
