import { getAllInstructors } from '@/app/actions/authActions';
import { getActiveInstructor } from '@/lib/auth/server';
import SignInClient from './SignInClient';

export const revalidate = 0;

export default async function SignInPage() {
  const [instructors, currentInstructor] = await Promise.all([
    getAllInstructors(),
    getActiveInstructor(),
  ]);

  return <SignInClient instructors={instructors} currentInstructor={currentInstructor} />;
}
