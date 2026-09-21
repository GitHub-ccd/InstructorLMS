import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for InstructorLMS...');

  // Clean existing data in relational order
  await prisma.homeworkSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.studentStrategy.deleteMany();
  await prisma.instructorTimeLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();

  // ==========================================
  // 1. Create Instructors
  // ==========================================
  const alex = await prisma.instructor.create({
    data: {
      name: 'Dr. Indika Perera',
      email: 'indika.perera@instructorlms.edu',
      role: 'ADMIN',
      avatarUrl: '/avatars/instructors/Indika Perera.jpg',
    },
  });

  const sarah = await prisma.instructor.create({
    data: {
      name: 'Prof. Sarah Connor',
      email: 'sarah.connor@instructorlms.edu',
      role: 'INSTRUCTOR',
      avatarUrl: '/avatars/instructors/sarah-connor.jpg',
    },
  });

  console.log(`👤 Created Instructors: ${alex.name} (ADMIN) & ${sarah.name} (INSTRUCTOR)`);

  // ==========================================
  // 2. Create Courses
  // ==========================================
  // Alex's Course
  const courseCS = await prisma.course.create({
    data: {
      instructorId: alex.id,
      name: 'Web Development Fundamentals',
      code: 'CS101',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 75,
    },
  });

  // Sarah's Courses (2 Courses to test course switching!)
  const courseDS = await prisma.course.create({
    data: {
      instructorId: sarah.id,
      name: 'Data Science & Analytics',
      code: 'DS201',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 90,
    },
  });

  const courseSTAT = await prisma.course.create({
    data: {
      instructorId: sarah.id,
      name: 'Applied Statistics & Inference',
      code: 'STAT105',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 75,
    },
  });

  // Pre-approved Institutional Catalog Courses (Created by Academic Administration)
  const courseMATH = await prisma.course.create({
    data: {
      instructorId: alex.id,
      name: 'Discrete Mathematics & Logic',
      code: 'MATH101',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 60,
    },
  });

  const courseCS350 = await prisma.course.create({
    data: {
      instructorId: alex.id,
      name: 'Cloud Computing & Distributed Systems',
      code: 'CS350',
      term: 'Fall 2026',
      defaultClassLengthMinutes: 90,
    },
  });

  console.log(`📚 Created Courses: ${courseCS.code}, ${courseMATH.code}, ${courseCS350.code} (Admin Alex), ${courseDS.code} & ${courseSTAT.code} (Sarah)`);

  // ==========================================
  // 3. Create Students
  // ==========================================
  const studentAvatars = [
    '/avatars/students/student-1.jpg',
    '/avatars/students/student-2.jpg',
    '/avatars/students/student-3.jpg',
    '/avatars/students/student-4.jpg',
    '/avatars/students/student-5.jpg',
    '/avatars/students/student-6.jpg',
  ];

  const csStudentsData = [
    { name: 'Marcus Brody', email: 'marcus.b@student.edu' },
    { name: 'Elena Rostova', email: 'elena.r@student.edu' },
    { name: 'Sam Chen', email: 'sam.c@student.edu' },
    { name: 'Priya Patel', email: 'priya.p@student.edu' },
    { name: 'Jordan Lee', email: 'jordan.l@student.edu' },
    { name: 'Hannah Abbott', email: 'hannah.a@student.edu' },
    { name: 'Carlos Mendez', email: 'carlos.m@student.edu' },
    { name: 'Olivia Taylor', email: 'olivia.t@student.edu' },
  ];

  let avatarIndex = 0;

  const csStudents = [];
  for (const s of csStudentsData) {
    const student = await prisma.student.create({
      data: {
        courseId: courseCS.id,
        ...s,
        avatarUrl: studentAvatars[avatarIndex % studentAvatars.length],
        isRemoved: false,
      },
    });
    avatarIndex++;
    csStudents.push(student);
  }

  // Sarah's DS201 Students (10 students, 1 archived/soft-deleted)
  const dsStudentsData = [
    { name: 'Liam O\'Connor', email: 'liam.o@student.edu', isRemoved: false },
    { name: 'Sophia Martinez', email: 'sophia.m@student.edu', isRemoved: false },
    { name: 'Benjamin Wright', email: 'ben.w@student.edu', isRemoved: false },
    { name: 'Chloe Dubois', email: 'chloe.d@student.edu', isRemoved: false },
    { name: 'Daniel Kim', email: 'daniel.k@student.edu', isRemoved: false },
    { name: 'Ava Robinson', email: 'ava.r@student.edu', isRemoved: false },
    { name: 'Ethan Walker', email: 'ethan.w@student.edu', isRemoved: true }, // ARCHIVED to test QC
    { name: 'Zoe Jackson', email: 'zoe.j@student.edu', isRemoved: false },
    { name: 'Lucas Vance', email: 'lucas.v@student.edu', isRemoved: false },
    { name: 'Maya Lin', email: 'maya.l@student.edu', isRemoved: false },
  ];

  const dsStudents = [];
  for (const s of dsStudentsData) {
    const student = await prisma.student.create({
      data: {
        courseId: courseDS.id,
        ...s,
        avatarUrl: studentAvatars[avatarIndex % studentAvatars.length],
      },
    });
    avatarIndex++;
    dsStudents.push(student);
  }

  // Sarah's STAT105 Students (8 students)
  const statStudentsData = [
    { name: 'Noah Patel', email: 'noah.p@student.edu', isRemoved: false },
    { name: 'Emma Watson', email: 'emma.w@student.edu', isRemoved: false },
    { name: 'Oliver Queen', email: 'oliver.q@student.edu', isRemoved: false },
    { name: 'Mia Khalifa', email: 'mia.k@student.edu', isRemoved: false },
    { name: 'Lucas Scott', email: 'lucas.s@student.edu', isRemoved: false },
    { name: 'Harper Lee', email: 'harper.l@student.edu', isRemoved: false },
    { name: 'Henry Cavill', email: 'henry.c@student.edu', isRemoved: false },
    { name: 'Grace Hopper', email: 'grace.h@student.edu', isRemoved: false },
  ];

  const statStudents = [];
  for (const s of statStudentsData) {
    const student = await prisma.student.create({
      data: {
        courseId: courseSTAT.id,
        ...s,
        avatarUrl: studentAvatars[avatarIndex % studentAvatars.length],
      },
    });
    avatarIndex++;
    statStudents.push(student);
  }

  console.log(`👨‍🎓 Seeded ${csStudents.length + dsStudents.length + statStudents.length} Students across 3 course sections`);

  // ==========================================
  // 4. Student Academic Strategies (Interventions)
  // ==========================================
  // Alex's students
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

  // Sarah's DS201 interventions
  await prisma.studentStrategy.create({
    data: {
      studentId: dsStudents[1].id, // Sophia Martinez
      strategyNotes: 'Sophia struggled with Pandas multi-index aggregation and group-by transformations. Completed a 20-minute 1-on-1 code walkthrough; paired with Ben Wright for peer code review.',
    },
  });

  await prisma.studentStrategy.create({
    data: {
      studentId: dsStudents[4].id, // Daniel Kim
      strategyNotes: 'Daniel had two unexcused absences due to collegiate athletics travel. Agreed to submit Jupyter lab notebooks asynchronously via GitHub before Friday 11:59 PM.',
    },
  });

  // Sarah's STAT105 intervention
  await prisma.studentStrategy.create({
    data: {
      studentId: statStudents[4].id, // Lucas Scott
      strategyNotes: 'Lucas is struggling with hypothesis testing (p-values vs alpha thresholds and Type I/II errors). Recommended the interactive visual stats simulator and scheduled an office hours review session.',
    },
  });

  console.log(`💡 Seeded Academic Intervention Strategies for Alex and Sarah`);

  // ==========================================
  // 5. Attendance Sessions & Records
  // ==========================================
  // Alex's past dates
  const alexDates = [
    new Date('2026-09-02T09:00:00Z'),
    new Date('2026-09-04T09:00:00Z'),
    new Date('2026-09-09T09:00:00Z'),
    new Date('2026-09-11T09:00:00Z'),
    new Date('2026-09-16T09:00:00Z'),
  ];

  for (const date of alexDates) {
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: courseCS.id,
        date,
        notes: `Lecture session - ${date.toLocaleDateString()}`,
      },
    });

    for (let i = 0; i < csStudents.length; i++) {
      let status = 'PRESENT';
      if (i === 2 && date.getDate() % 2 === 1) status = 'ABSENT'; // Sam Chen
      if (i === 4 && date.getDate() === 4) status = 'LATE'; // Jordan Lee

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: csStudents[i].id,
          status,
        },
      });
    }
  }

  // Sarah's DS201 Sessions: mix of today, recent 14-day backfill dates, and 1 historical locked date
  const sarahDSDates = [
    new Date('2026-08-28T14:00:00Z'), // Historical (>14d) to test locked badge!
    new Date('2026-09-06T14:00:00Z'), // 12 days ago
    new Date('2026-09-09T14:00:00Z'), // 9 days ago
    new Date('2026-09-12T14:00:00Z'), // 6 days ago
    new Date('2026-09-15T14:00:00Z'), // 3 days ago
    new Date('2026-09-18T14:00:00Z'), // Today!
  ];

  for (const date of sarahDSDates) {
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: courseDS.id,
        date,
        notes: `DS201 Lab Session - ${date.toLocaleDateString()}`,
      },
    });

    for (let i = 0; i < dsStudents.length; i++) {
      let status = 'PRESENT';
      if (i === 4 && (date.getDate() === 9 || date.getDate() === 12)) status = 'ABSENT'; // Daniel Kim
      if (i === 1 && date.getDate() === 15) status = 'LATE'; // Sophia Martinez
      if (i === 6) status = 'ABSENT'; // Ethan Walker (archived student)

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: dsStudents[i].id,
          status,
        },
      });
    }
  }

  // Sarah's STAT105 Sessions (3 recent sessions)
  const sarahSTATDates = [
    new Date('2026-09-08T10:00:00Z'),
    new Date('2026-09-11T10:00:00Z'),
    new Date('2026-09-16T10:00:00Z'),
  ];

  for (const date of sarahSTATDates) {
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: courseSTAT.id,
        date,
        notes: `STAT105 Problem Session - ${date.toLocaleDateString()}`,
      },
    });

    for (let i = 0; i < statStudents.length; i++) {
      let status = 'PRESENT';
      if (i === 4 && date.getDate() === 11) status = 'ABSENT'; // Lucas Scott
      if (i === 2 && date.getDate() === 16) status = 'LATE'; // Oliver Queen

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: statStudents[i].id,
          status,
        },
      });
    }
  }

  console.log(`📅 Seeded Attendance Sessions & Records for Alex (CS101) and Sarah (DS201, STAT105)`);

  // ==========================================
  // 6. Assignments & Deliverable Matrix
  // ==========================================
  // Alex CS101 Assignments
  const csAssignments = [
    { title: 'Assignment 1: Semantic HTML & DOM', dueDate: new Date('2026-09-06T23:59:59Z'), totalPoints: 100, type: 'HOMEWORK' as const },
    { title: 'Quiz 1: CSS Box Model & Flexbox', dueDate: new Date('2026-09-13T23:59:59Z'), totalPoints: 50, type: 'QUIZ' as const },
    { title: 'Presentation: Modern Web Architecture', dueDate: new Date('2026-09-20T23:59:59Z'), totalPoints: 100, type: 'PRESENTATION' as const },
  ];

  for (const aData of csAssignments) {
    const assignment = await prisma.assignment.create({
      data: { courseId: courseCS.id, ...aData },
    });

    for (let i = 0; i < csStudents.length; i++) {
      let status = 'GRADED';
      let grade: number | null = Math.floor(Math.random() * 15) + 85;

      if (i === 6 && aData.type === 'HOMEWORK') {
        status = 'MISSING';
        grade = null;
      } else if (i === 2 && aData.type === 'QUIZ') {
        status = 'SUBMITTED';
        grade = null;
      }

      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: csStudents[i].id,
          status,
          grade,
        },
      });
    }
  }

  // Sarah DS201 Assignments (5 assignments across Homework, Quiz, Presentation to test horizontal scroll!)
  const dsAssignments = [
    { title: 'Lab 1: NumPy & Vectorized Math', dueDate: new Date('2026-09-04T23:59:59Z'), totalPoints: 100, type: 'HOMEWORK' as const },
    { title: 'Quiz 1: Probability & Random Variables', dueDate: new Date('2026-09-08T23:59:59Z'), totalPoints: 50, type: 'QUIZ' as const },
    { title: 'Lab 2: Pandas Data Wrangling & Cleaning', dueDate: new Date('2026-09-14T23:59:59Z'), totalPoints: 100, type: 'HOMEWORK' as const },
    { title: 'Quiz 2: Regression Loss & Gradient Descent', dueDate: new Date('2026-09-17T23:59:59Z'), totalPoints: 50, type: 'QUIZ' as const },
    { title: 'Capstone: Predictive Machine Learning Pipeline', dueDate: new Date('2026-09-25T23:59:59Z'), totalPoints: 150, type: 'PRESENTATION' as const },
  ];

  for (const aData of dsAssignments) {
    const assignment = await prisma.assignment.create({
      data: { courseId: courseDS.id, ...aData },
    });

    for (let i = 0; i < dsStudents.length; i++) {
      let status = 'GRADED';
      let grade: number | null = Math.floor(Math.random() * 18) + 82;

      // Make Daniel Kim and Sophia Martinez have some missing/submitted work for realistic QC
      if (i === 4 && aData.title.includes('Pandas')) {
        status = 'MISSING';
        grade = null;
      } else if (i === 1 && aData.type === 'QUIZ' && aData.title.includes('Quiz 2')) {
        status = 'SUBMITTED';
        grade = null;
      } else if (aData.type === 'PRESENTATION') {
        // Upcoming capstone is submitted or pending
        status = i % 2 === 0 ? 'SUBMITTED' : 'MISSING';
        grade = null;
      }

      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: dsStudents[i].id,
          status,
          grade,
        },
      });
    }
  }

  // Sarah STAT105 Assignments
  const statAssignments = [
    { title: 'Problem Set 1: Central Tendency & Variance', dueDate: new Date('2026-09-07T23:59:59Z'), totalPoints: 100, type: 'HOMEWORK' as const },
    { title: 'Quiz 1: Bayes Rule & Conditional Odds', dueDate: new Date('2026-09-14T23:59:59Z'), totalPoints: 50, type: 'QUIZ' as const },
    { title: 'Case Study: A/B Testing Significance Analysis', dueDate: new Date('2026-09-22T23:59:59Z'), totalPoints: 100, type: 'PRESENTATION' as const },
  ];

  for (const aData of statAssignments) {
    const assignment = await prisma.assignment.create({
      data: { courseId: courseSTAT.id, ...aData },
    });

    for (let i = 0; i < statStudents.length; i++) {
      let status = 'GRADED';
      let grade: number | null = Math.floor(Math.random() * 16) + 84;

      if (i === 4 && aData.type === 'HOMEWORK') {
        status = 'MISSING';
        grade = null;
      } else if (aData.type === 'PRESENTATION') {
        status = 'SUBMITTED';
        grade = null;
      }

      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: statStudents[i].id,
          status,
          grade,
        },
      });
    }
  }

  console.log(`📝 Seeded Extensive Deliverable Matrices (Homework, Quizzes, Presentations) for both instructors`);

  // ==========================================
  // 7. Instructor Workload Logs
  // ==========================================
  // Alex logs (CS101)
  const alexLogDates = [
    new Date('2026-09-02'),
    new Date('2026-09-04'),
    new Date('2026-09-09'),
    new Date('2026-09-11'),
    new Date('2026-09-16'),
  ];

  for (const sessionDate of alexLogDates) {
    await prisma.instructorTimeLog.create({
      data: {
        courseId: courseCS.id,
        sessionDate,
        prepTimeHours: 1.5,
        contactHours: 1.25,
        notes: 'Slide review, lab setup, and grading homework deliverables.',
      },
    });
  }

  // Sarah logs (DS201 & STAT105)
  const sarahDSLogs = [
    { date: new Date('2026-09-04'), prep: 2.0, contact: 1.5, notes: 'Prepared Jupyter Notebook datasets and led live NumPy coding session.' },
    { date: new Date('2026-09-08'), prep: 1.5, contact: 1.5, notes: 'Administered Quiz 1 and conducted office hours on probability.' },
    { date: new Date('2026-09-12'), prep: 2.5, contact: 1.5, notes: 'Graded Lab 1 submissions and prepared Pandas cleaning datasets.' },
    { date: new Date('2026-09-15'), prep: 1.75, contact: 1.5, notes: 'Live demonstration of gradient descent and regression metrics.' },
    { date: new Date('2026-09-18'), prep: 2.0, contact: 1.5, notes: 'Capstone pipeline mentoring and individual group consultations.' },
  ];

  for (const l of sarahDSLogs) {
    await prisma.instructorTimeLog.create({
      data: {
        courseId: courseDS.id,
        sessionDate: l.date,
        prepTimeHours: l.prep,
        contactHours: l.contact,
        notes: l.notes,
      },
    });
  }

  const sarahSTATLogs = [
    { date: new Date('2026-09-08'), prep: 1.5, contact: 1.25, notes: 'Lecture on Central Limit Theorem and variance properties.' },
    { date: new Date('2026-09-11'), prep: 2.0, contact: 1.25, notes: 'Reviewed Problem Set 1 solutions and held tutoring circle.' },
    { date: new Date('2026-09-16'), prep: 1.5, contact: 1.25, notes: 'Quiz 1 administration and introduction to A/B testing.' },
  ];

  for (const l of sarahSTATLogs) {
    await prisma.instructorTimeLog.create({
      data: {
        courseId: courseSTAT.id,
        sessionDate: l.date,
        prepTimeHours: l.prep,
        contactHours: l.contact,
        notes: l.notes,
      },
    });
  }

  console.log(`⏱️ Seeded Realistic Instructor Workload Logs across all courses`);
  console.log('✅ Comprehensive database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
