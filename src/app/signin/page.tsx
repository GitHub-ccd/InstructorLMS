import { getAllInstructors } from '@/app/actions/authActions';
import SignInClient from './SignInClient';

export const revalidate = 0;

export default async function SignInPage() {
  const instructors = await getAllInstructors();
  return <SignInClient instructors={instructors} />;
}
