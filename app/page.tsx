import Home from './home-client';
import {isSchoolLocked} from '@/lib/school-hours';

// The lock follows the clock, so this page cannot be frozen at build time.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Home initialLocked={isSchoolLocked()} />;
}
