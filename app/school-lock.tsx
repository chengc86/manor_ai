import {GraduationCap, Shield} from 'lucide-react';
import {schoolLockCopy} from '@/lib/school-hours';

export function SchoolLockScreen() {
  const copy = schoolLockCopy();
  return (
    <main className="school-lock">
      <section className="school-lock-card" aria-labelledby="school-lock-title">
        <div className="brand">
          <Shield aria-hidden="true" />
          <span className="brand-lockup"><strong>MANOR <em>QUEST</em></strong></span>
        </div>
        <p className="school-lock-kicker">School hours</p>
        <h1 id="school-lock-title">{copy.title}</h1>
        <p className="school-lock-body">{copy.body}</p>
        <p className="school-lock-hours"><GraduationCap aria-hidden="true" size={18} />{copy.hours}</p>
        <p className="school-lock-note">{copy.note}</p>
      </section>
    </main>
  );
}
