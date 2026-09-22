import { createNeonAuth } from '@neondatabase/auth/next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || 'https://ep-holy-frog-b4s2lamt.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth',
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || 'oor6+K1ZnjGzuFBZ2LNxwXq+fS6YGM4BHYp+HnGxo2g=',
  },
});

const INSTRUCTOR_COOKIE = 'active_instructor_id';

export async function getActiveInstructor() {
  try {
    const cookieStore = cookies();
    const cookieInstructorId = cookieStore.get(INSTRUCTOR_COOKIE)?.value;

    // Check if Neon Auth has a user
    let emailFromAuth: string | null = null;
    try {
      const sessionResult = await auth.getSession();
      if (sessionResult?.data?.user?.email) {
        emailFromAuth = sessionResult.data.user.email;
      }
    } catch {
      // Auth session not present or not authenticated
    }

    if (emailFromAuth) {
      const instructorByEmail = await prisma.instructor.findUnique({
        where: { email: emailFromAuth },
        include: { courses: true },
      });
      if (instructorByEmail) return instructorByEmail;
    }

    if (cookieInstructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: cookieInstructorId },
        include: { courses: true },
      });
      if (instructor) return instructor;
    }

    // Strict persona gate: return null if not authenticated
    return null;
  } catch (err) {
    console.error('Error fetching active instructor:', err);
    return null;
  }
}
