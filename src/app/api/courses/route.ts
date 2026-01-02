import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  CourseWithInstructor,
  CreateCourseInput,
  ApiResponse,
  PaginatedResponse,
  CourseFilters,
  UserRole,
} from "@/types";

// ============================================
// Helper Functions
// ============================================

/**
 * Get user from session (Placeholder for NextAuth)
 * TODO: Replace with actual NextAuth session handling
 */
async function getCurrentUser(request: NextRequest) {
  // Placeholder: In production, use NextAuth's getServerSession()
  // Example:
  // const session = await getServerSession(authOptions);
  // if (!session?.user) return null;
  // return session.user;

  // For now, return mock user based on header (development only)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role") as UserRole;

  if (!userId) return null;

  return {
    id: userId,
    role: userRole || UserRole.STUDENT,
  };
}

/**
 * Check if user has required role
 */
function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Build course filters from query params
 */
function buildCourseFilters(searchParams: URLSearchParams): CourseFilters {
  const filters: CourseFilters = {};

  if (searchParams.get("search")) {
    filters.search = searchParams.get("search")!;
  }
  if (searchParams.get("category")) {
    filters.category = searchParams.get("category")!;
  }
  if (searchParams.get("level")) {
    filters.level = searchParams.get("level")!;
  }
  if (searchParams.get("minPrice")) {
    filters.minPrice = parseFloat(searchParams.get("minPrice")!);
  }
  if (searchParams.get("maxPrice")) {
    filters.maxPrice = parseFloat(searchParams.get("maxPrice")!);
  }
  if (searchParams.get("instructorId")) {
    filters.instructorId = searchParams.get("instructorId")!;
  }

  return filters;
}

// ============================================
// GET /api/courses
// Get list of courses with optional filtering
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const filters = buildCourseFilters(searchParams);

    // Build where clause
    const where: {
      deletedAt: null;
      isActive: boolean;
      isPublished?: boolean;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
        shortDescription?: { contains: string; mode: "insensitive" };
      }>;
      category?: string;
      level?: string;
      price?: {
        gte?: number;
        lte?: number;
      };
      instructorId?: string;
    } = {
      deletedAt: null,
      isActive: true,
    };

    // Only show published courses to non-instructors/admins
    const user = await getCurrentUser(request);
    if (!user || user.role === UserRole.STUDENT) {
      where.isPublished = true;
    }

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { shortDescription: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.instructorId) {
      where.instructorId = filters.instructorId;
    }

    // Fetch courses and total count
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              image: true,
              emailVerified: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              phoneNumber: true,
            },
          },
          _count: {
            select: {
              sessions: true,
              bookings: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({ where }),
    ]);

    // Transform Decimal to number for JSON serialization
    const coursesWithNumbers = courses.map((course) => ({
      ...course,
      price: course.price.toNumber(),
    }));

    const response: PaginatedResponse<CourseWithInstructor> = {
      success: true,
      data: coursesWithNumbers as CourseWithInstructor[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching courses:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch courses",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// ============================================
// POST /api/courses
// Create a new course (Instructor/Admin only)
// ============================================

export async function POST(request: NextRequest) {
  try {
    // RBAC: Check authentication and authorization
    const user = await getCurrentUser(request);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to create a course",
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (!hasRole(user.role, [UserRole.INSTRUCTOR, UserRole.ADMIN])) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden",
        message: "Only instructors and admins can create courses",
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Parse request body
    const body: CreateCourseInput = await request.json();

    // Validate required fields
    const requiredFields: (keyof CreateCourseInput)[] = [
      "title",
      "description",
      "category",
      "level",
      "price",
      "duration",
      "instructorId",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Additional validation
    if (body.price < 0) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        message: "Price must be a positive number",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (body.duration < 1) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        message: "Duration must be at least 1 hour",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verify instructor exists and has correct role
    const instructor = await prisma.user.findUnique({
      where: { id: body.instructorId },
    });

    if (!instructor) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        message: "Instructor not found",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (
      instructor.role !== UserRole.INSTRUCTOR &&
      instructor.role !== UserRole.ADMIN
    ) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        message: "User is not an instructor",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If user is INSTRUCTOR (not ADMIN), they can only create courses for themselves
    if (user.role === UserRole.INSTRUCTOR && body.instructorId !== user.id) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden",
        message: "You can only create courses for yourself",
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription,
        category: body.category,
        level: body.level,
        thumbnail: body.thumbnail,
        price: body.price,
        duration: body.duration,
        maxStudents: body.maxStudents || 30,
        instructorId: body.instructorId,
        prerequisites: body.prerequisites,
        learningOutcomes: body.learningOutcomes,
        syllabus: body.syllabus,
        isPublished: body.isPublished || false,
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            image: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Log audit trail
    await prisma.audit.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "Course",
        entityId: course.id,
        metadata: {
          courseTitle: course.title,
          instructorId: course.instructorId,
        },
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    // Transform Decimal to number
    const courseWithNumber = {
      ...course,
      price: course.price.toNumber(),
    };

    const response: ApiResponse<CourseWithInstructor> = {
      success: true,
      data: courseWithNumber as CourseWithInstructor,
      message: "Course created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to create course",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
