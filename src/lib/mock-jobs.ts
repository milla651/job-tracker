// Re-export from the new optimized jobs loader
export {
  type ScrapedJob
}

from "@/lib/jobs-loader";

export {
  getPaginatedJobs,
  getTotalJobCount,
  getJobById,
}

from "@/lib/jobs-loader";

// Legacy export for backward compatibility
import {
  loadAllJobs,
  type ScrapedJob
}

from "@/lib/jobs-loader";

/**
 * Legacy function for backward compatibility - loads all jobs from scraped_jobs.json
 * For new code, use getPaginatedJobs() for better performance with pagination
 */
export async function getMockJobs() {
  return await loadAllJobs();
}

// Legacy MOCK_JOBS array - now just an empty fallback
export const MOCK_JOBS: ScrapedJob[]=[];