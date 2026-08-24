import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect root visitors to the login page
  redirect('/login');
}
