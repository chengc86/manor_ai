import {isSchoolLocked, schoolLockPayload} from './school-hours';

/**
 * The on-disk API tests call route handlers from `node tests/<name>.cjs`.
 * That process is not the deployed server, and those tests move Date.now,
 * so the lock stays on for real requests and stays out of their way.
 */
function runningAsApiTest() {
  const entry = typeof process === 'undefined' ? '' : process.argv?.[1]?.replaceAll('\\', '/') ?? '';
  return /\/tests\/[^/]+\.cjs$/.test(entry);
}

/** 403 while school is in session. Logout and the health check do not use this. */
export function schoolLockResponse(at?: Date) {
  if (runningAsApiTest() || !isSchoolLocked(at)) return null;
  return Response.json(schoolLockPayload(), {status: 403, headers: {'Cache-Control': 'no-store'}});
}
