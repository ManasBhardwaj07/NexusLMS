CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Invariant: User can have only one ACTIVE enrollment per course (Prisma does not support partial indexes)
CREATE UNIQUE INDEX one_active_enrollment ON "Enrollment" ("userId", "courseId") WHERE status = 'ACTIVE';

CREATE INDEX course_title_trgm ON "Course" USING gin (title gin_trgm_ops);