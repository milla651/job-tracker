import { revalidateTag } from "next/cache";

/** Next.js cache tag for user-scoped data; pair with revalidate after mutations. */
export function userCacheTag(userId: string): string {
  return `user:${userId}`;
}

/** Invalidate cached dashboard and other user-tagged reads (Next.js 16 requires a profile on revalidateTag). */
export function revalidateUserCache(userId: string): void {
  revalidateTag(userCacheTag(userId), "max");
}
