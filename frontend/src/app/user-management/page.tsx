import { redirect } from 'next/navigation';

export default function UserManagementRoot() {
  redirect('/user-management/dashboard');
}
