import { redirect } from 'next/navigation';

// §20: root redirect — single source, not duplicated in next.config
export default function RootPage() {
  redirect('/tr');
}
