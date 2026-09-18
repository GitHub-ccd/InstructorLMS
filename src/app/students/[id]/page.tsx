import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StudentDetailClient from './StudentDetailClient';

export const revalidate = 0;

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      course: true,
      attendanceRecords: {
        include: {
          session: true,
        },
        orderBy: {
          session: {
            date: 'desc',
          },
        },
      },
      homeworkSubmissions: {
        include: {
          assignment: true,
        },
      },
      strategies: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  return <StudentDetailClient student={student} />;
}
