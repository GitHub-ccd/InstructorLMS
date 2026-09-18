import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting fictitious database seed...');

  // Clean existing data
  await prisma.homeworkSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.studentStrategy.deleteMany();
  await prisma.instructorTimeLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();

  // 1. Create Instructors
  const instructor = await prisma.instructor.create({
    data: {
      name: 'Dr. Alex Vance',
      email: 'alex.vance@instructorlms.edu',
      role: 'ADMIN',
    },
  });

  const instructor2 = await prisma.instructor.create({
    data: {
      name: 'Prof. Sarah Connor',
      email: 'sarah.connor@instructorlms.edu',
      role: 'INSTRUCTOR',
    },
  });

  console.log(`👤 Created Instructors: ${instructor.name} (ADMIN), ${instructor2.name} (INSTRUCTOR)`);

  // 2. Create Courses
  const courseCS = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      name: 'Web Development Fundamentals',
      code: 'CS101',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 75,
    },
  });

  const courseDS = await prisma.course.create({
    data: {
      instructorId: instructor2.id,
      name: 'Data Science & Analytics',
      code: 'DS201',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 90,
    },
  });

  console.log(`📚 Created Courses: ${courseCS.code} (Dr. Vance) and ${courseDS.code} (Prof. Connor)`);

  // 3. Create Students
  const csStudentData = [
    { name: 'Marcus Brody', email: 'marcus.b@student.edu' },
    { name: 'Elena Rostova', email: 'elena.r@student.edu' },
    { name: 'Sam Chen', email: 'sam.c@student.edu' },
    { name: 'Priya Patel', email: 'priya.p@student.edu' },
    { name: 'Jordan Lee', email: 'jordan.l@student.edu' },
    { name: 'Hannah Abbott', email: 'hannah.a@student.edu' },
    { name: 'Carlos Mendez', email: 'carlos.m@student.edu' },
    { name: 'Olivia Taylor', email: 'olivia.t@student.edu' },
  ];

  const dsStudentData = [
    { name: 'Liam O\'Connor', email: 'liam.o@student.edu' },
    { name: 'Sophia Martinez', email: 'sophia.m@student.edu' },
    { name: 'Benjamin Wright', email: 'ben.w@student.edu' },
    { name: 'Chloe Dubois', email: 'chloe.d@student.edu' },
    { name: 'Daniel Kim', email: 'daniel.k@student.edu' },
    { name: 'Ava Robinson', email: 'ava.r@student.edu' },
    { name: 'Ethan Walker', email: 'ethan.w@student.edu' },
    { name: 'Zoe Jackson', email: 'zoe.j@student.edu' },
  ];

  const csStudents = [];
  for (const s of csStudentData) {
    const student = await prisma.student.create({
      data: { courseId: courseCS.id, ...s },
    });
    csStudents.push(student);
  }

  const dsStudents = [];
  for (const s of dsStudentData) {
    const student = await prisma.student.create({
      data: { courseId: courseDS.id, ...s },
    });
    dsStudents.push(student);
  }

  console.log(`👨‍🎓 Created ${csStudents.length + dsStudents.length} Students across courses`);

  // 4. Create Student Strategies for At-Risk Students
  await prisma.studentStrategy.create({
    data: {
      studentId: csStudents[2].id, // Sam Chen
      strategyNotes: 'Sam missed 2 consecutive classes due to transit issues. Provided recorded lecture notes and agreed on a 15-minute weekly office hours check-in every Tuesday.',
    },
  });

  await prisma.studentStrategy.create({
    data: {
      studentId: csStudents[6].id, // Carlos Mendez
      strategyNotes: 'Carlos is struggling with CSS Grid & Flexbox concepts. Paired him with Marcus Brody for peer review on Assignment 2.',
    },
  });

  // 5. Create Attendance Sessions & Records
  const pastDates = [
    new Date('2026-09-01T09:00:00Z'),
    new Date('2026-09-03T09:00:00Z'),
    new Date('2026-09-08T09:00:00Z'),
    new Date('2026-09-10T09:00:00Z'),
    new Date('2026-09-15T09:00:00Z'),
  ];

  for (const date of pastDates) {
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: courseCS.id,
        date,
        notes: `Regular session - ${date.toLocaleDateString()}`,
      },
    });

    for (let i = 0; i < csStudents.length; i++) {
      let status = 'PRESENT';
      if (i === 2 && date.getDate() % 2 === 1) status = 'ABSENT'; // Sam Chen
      if (i === 4 && date.getDate() === 3) status = 'LATE'; // Jordan Lee

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: csStudents[i].id,
          status,
        },
      });
    }
  }

  console.log(`📅 Seeded Attendance Sessions & Records`);

  // 6. Create Assignments & Homework Matrix
  const csAssignments = [
    { title: 'Assignment 1: HTML Semantic Structure', dueDate: new Date('2026-09-05T23:59:59Z'), totalPoints: 100, type: 'HOMEWORK' as const },
    { title: 'Quiz 1: CSS Flexbox & Box Model', dueDate: new Date('2026-09-12T23:59:59Z'), totalPoints: 50, type: 'QUIZ' as const },
    { title: 'Presentation: Modern Web Architecture', dueDate: new Date('2026-09-19T23:59:59Z'), totalPoints: 100, type: 'PRESENTATION' as const },
  ];

  for (const aData of csAssignments) {
    const assignment = await prisma.assignment.create({
      data: { courseId: courseCS.id, ...aData },
    });

    for (let i = 0; i < csStudents.length; i++) {
      let status = 'GRADED';
      let grade: number | null = Math.floor(Math.random() * 20) + 80;

      if (i === 6 && aData.title.includes('JavaScript')) {
        status = 'MISSING';
        grade = null;
      } else if (i === 2 && aData.title.includes('CSS')) {
        status = 'SUBMITTED';
        grade = null;
      }

      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: csStudents[i].id,
          status,
          grade: grade,
        },
      });
    }
  }

  console.log(`📝 Seeded Assignments & Homework Matrix`);

  // 7. Create Instructor Workload Logs
  const logDates = [
    new Date('2026-09-01'),
    new Date('2026-09-03'),
    new Date('2026-09-08'),
    new Date('2026-09-10'),
    new Date('2026-09-15'),
  ];

  for (const sessionDate of logDates) {
    await prisma.instructorTimeLog.create({
      data: {
        courseId: courseCS.id,
        sessionDate,
        prepTimeHours: 1.5,
        contactHours: 1.25,
        notes: 'Lecture preparation, slide updates, and assignment grading.',
      },
    });
  }

  console.log(`⏱️ Seeded Instructor Workload Logs`);
  console.log('✅ Fictitious database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
