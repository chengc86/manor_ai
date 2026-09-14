declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    TEACHER_PASSWORD?: string;
    BUCKET?: R2Bucket;
  }
}
