import { promises as fs } from "fs";
import path from "path";

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  logo: string;
  tags: string[];
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  source?: string;
  url: string;
  scrapedAt?: string;
}

// Cache for the loaded jobs data to avoid re-reading the file
let jobsCache: ScrapedJob[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Load jobs from the scraped_jobs.json file with caching
 */
async function loadAllJobs(): Promise<ScrapedJob[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (jobsCache !== null && now - cacheTimestamp < CACHE_DURATION) {
    return jobsCache;
  }

  try {
    const filePath = path.join(process.cwd(), "src/data/scraped_jobs.json");
    const data = await fs.readFile(filePath, "utf-8");
    const jobs = JSON.parse(data) as ScrapedJob[];
    jobsCache = jobs;
    cacheTimestamp = now;
    return jobs;
  } catch (error) {
    console.error("Failed to load jobs:", error);
    return [];
  }
}

/**
 * Search and filter jobs with pagination
 */
async function searchJobs(
  query: string,
  pageSize: number = 20,
): Promise<ScrapedJob[]> {
  const allJobs = await loadAllJobs();

  if (!query) {
    return allJobs.slice(0, pageSize);
  }

  const lowerQuery = query.toLowerCase();
  const filtered = allJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      job.description?.toLowerCase().includes(lowerQuery),
  );

  return filtered.slice(0, pageSize);
}

/**
 * Get paginated jobs with optional filtering
 */
async function getPaginatedJobs(
  page: number = 1,
  pageSize: number = 20,
  query?: string,
  category?: string,
  time?: string,
  location?: string,
  source?: string
): Promise<{
  jobs: ScrapedJob[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const allJobs = await loadAllJobs();

  let filtered = allJobs;

  // Filter by time
  if (time && time !== "any") {
    const now = new Date();
    filtered = filtered.filter((job) => {
      const jobDate = new Date(job.postedAt);
      if (isNaN(jobDate.getTime())) return true;
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
      if (time === "today") return diffDays <= 1;
      if (time === "week") return diffDays <= 7;
      if (time === "month") return diffDays <= 30;
      return true;
    });
  }

  // Filter by location
  if (location && location.trim() !== "") {
    const lowerLocation = location.toLowerCase();
    filtered = filtered.filter((job) =>
      job.location.toLowerCase().includes(lowerLocation)
    );
  }

  // Filter by source
  if (source && source !== "any") {
    const lowerSource = source.toLowerCase();
    filtered = filtered.filter((job) => {
      const jobSource = (job.source || "Direct").toLowerCase();
      return jobSource.includes(lowerSource);
    });
  }

  // Filter by category
  if (category && category !== "any") {
    filtered = filtered.filter(
      (job) =>
        job.type.toLowerCase() === category.toLowerCase() ||
        job.tags?.some((tag) => tag.toLowerCase() === category.toLowerCase()) ||
        job.source?.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        job.description?.toLowerCase().includes(lowerQuery),
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const normalizedPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (normalizedPage - 1) * pageSize;
  const jobs = filtered.slice(startIndex, startIndex + pageSize);

  return {
    jobs,
    total,
    page: normalizedPage,
    pageSize,
    totalPages,
  };
}

/**
 * Get a batch of jobs by their indices for virtualized rendering
 */
async function getJobBatch(
  startIndex: number,
  batchSize: number,
  query?: string,
): Promise<ScrapedJob[]> {
  const allJobs = await loadAllJobs();

  // Filter by search query
  let filtered = allJobs;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = allJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        job.description?.toLowerCase().includes(lowerQuery),
    );
  }

  return filtered.slice(startIndex, startIndex + batchSize);
}

/**
 * Get total job count (useful for pagination UI)
 */
async function getTotalJobCount(query?: string): Promise<number> {
  const allJobs = await loadAllJobs();

  if (!query) {
    return allJobs.length;
  }

  const lowerQuery = query.toLowerCase();
  return allJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      job.description?.toLowerCase().includes(lowerQuery),
  ).length;
}

/**
 * Get a single job by ID
 */
async function getJobById(id: string): Promise<ScrapedJob | null> {
  const allJobs = await loadAllJobs();
  return allJobs.find((job) => job.id === id) || null;
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
function clearCache(): void {
  jobsCache = null;
  cacheTimestamp = 0;
}

export {
  loadAllJobs,
  searchJobs,
  getPaginatedJobs,
  getJobBatch,
  getTotalJobCount,
  getJobById,
  clearCache,
};
