/**
 * TDD Test Suite: jobs-loader.ts
 *
 * Run: npx vitest src/lib/__tests__/jobs-loader.test.ts
 *
 * These tests were written BEFORE any refactoring — the RED phase.
 * They document what the module SHOULD do once fixed.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { promises as fs } from "fs";

// ─── Mock the filesystem so tests don't need actual scraped_jobs.json ──────────
vi.mock("fs", () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

// Re-import AFTER mocks are in place
const mockFs = vi.mocked(fs);

// Helper to build a minimal ScrapedJob fixture
const makeJob = (overrides: Partial<{
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
  url: string;
  source: string;
}> = {}) => ({
  id: "job-1",
  title: "Senior Engineer",
  company: "Acme",
  location: "Nairobi",
  salary: "KSH 100k",
  type: "Full-time",
  postedAt: new Date().toISOString(),
  logo: "",
  tags: ["typescript", "react"],
  description: "Build great things",
  url: "https://example.com/job/1",
  source: "LinkedIn",
  ...overrides,
});

// ─── Shared setup ──────────────────────────────────────────────────────────────
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
});

// ─── loadAllJobs ──────────────────────────────────────────────────────────────
describe("loadAllJobs", () => {
  it("returns parsed jobs from the JSON file", async () => {
    const jobs = [makeJob({ id: "1" }), makeJob({ id: "2" })];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { loadAllJobs } = await import("../jobs-loader");
    const result = await loadAllJobs();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
  });

  it("returns empty array when file cannot be read", async () => {
    mockFs.readFile.mockRejectedValue(new Error("ENOENT: file not found"));

    const { loadAllJobs } = await import("../jobs-loader");
    const result = await loadAllJobs();

    expect(result).toEqual([]);
  });

  it("returns cached result without re-reading the file on second call", async () => {
    const jobs = [makeJob()];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { loadAllJobs } = await import("../jobs-loader");
    await loadAllJobs();
    await loadAllJobs(); // second call should hit cache

    // readFile should only be called once
    expect(mockFs.readFile).toHaveBeenCalledTimes(1);
  });
});

// ─── searchJobs ───────────────────────────────────────────────────────────────
describe("searchJobs", () => {
  it("returns first N jobs when query is empty", async () => {
    const jobs = Array.from({ length: 30 }, (_, i) =>
      makeJob({ id: `job-${i}` })
    );
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { searchJobs } = await import("../jobs-loader");
    const result = await searchJobs("", 10);

    expect(result).toHaveLength(10);
  });

  it("filters by job title (case-insensitive)", async () => {
    const jobs = [
      makeJob({ id: "1", title: "Backend Engineer" }),
      makeJob({ id: "2", title: "Frontend Designer" }),
      makeJob({ id: "3", title: "backend developer" }), // lowercase
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { searchJobs } = await import("../jobs-loader");
    const result = await searchJobs("backend");

    expect(result).toHaveLength(2);
    expect(result.map((j) => j.id)).toEqual(["1", "3"]);
  });

  it("filters by company name", async () => {
    const jobs = [
      makeJob({ company: "Safaricom" }),
      makeJob({ company: "KCB Bank" }),
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { searchJobs } = await import("../jobs-loader");
    const result = await searchJobs("safaricom");

    expect(result).toHaveLength(1);
    expect(result[0].company).toBe("Safaricom");
  });

  it("filters by tags", async () => {
    const jobs = [
      makeJob({ tags: ["golang", "kubernetes"] }),
      makeJob({ tags: ["react", "nextjs"] }),
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { searchJobs } = await import("../jobs-loader");
    const result = await searchJobs("golang");

    expect(result).toHaveLength(1);
    expect(result[0].tags).toContain("golang");
  });

  it("respects pageSize limit on results", async () => {
    const jobs = Array.from({ length: 100 }, (_, i) =>
      makeJob({ id: `job-${i}`, title: "Engineer" })
    );
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { searchJobs } = await import("../jobs-loader");
    const result = await searchJobs("engineer", 5);

    expect(result).toHaveLength(5);
  });
});

// ─── getPaginatedJobs ─────────────────────────────────────────────────────────
describe("getPaginatedJobs", () => {
  const allJobs = Array.from({ length: 55 }, (_, i) =>
    makeJob({ id: `job-${i}`, type: i % 2 === 0 ? "Full-time" : "Contract" })
  );

  beforeEach(() => {
    mockFs.readFile.mockResolvedValue(JSON.stringify(allJobs) as any);
  });

  it("returns correct page and pagination metadata", async () => {
    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(1, 20);

    expect(result.jobs).toHaveLength(20);
    expect(result.total).toBe(55);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(1);
  });

  it("returns last page with remaining items", async () => {
    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(3, 20);

    expect(result.jobs).toHaveLength(15); // 55 - 40 = 15 remaining
    expect(result.page).toBe(3);
  });

  it("clamps page to 1 when page < 1 is given", async () => {
    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(0, 20);

    expect(result.page).toBe(1);
  });

  it("clamps page to totalPages when page > totalPages", async () => {
    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(999, 20);

    expect(result.page).toBe(result.totalPages);
  });

  it("filters by category (job type)", async () => {
    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(1, 100, undefined, "Full-time");

    expect(result.jobs.every((j) => j.type === "Full-time")).toBe(true);
  });

  it("filters by location", async () => {
    const mixedJobs = [
      makeJob({ id: "a", location: "Nairobi, Kenya" }),
      makeJob({ id: "b", location: "Mombasa, Kenya" }),
      makeJob({ id: "c", location: "Remote" }),
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(mixedJobs) as any);

    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(1, 20, undefined, undefined, undefined, "nairobi");

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].id).toBe("a");
  });

  it("filters by time: today only returns jobs posted within 24h", async () => {
    const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const timedJobs = [
      makeJob({ id: "fresh", postedAt: new Date().toISOString() }),
      makeJob({ id: "stale", postedAt: yesterday }),
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(timedJobs) as any);

    const { getPaginatedJobs } = await import("../jobs-loader");
    const result = await getPaginatedJobs(1, 20, undefined, undefined, "today");

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].id).toBe("fresh");
  });
});

// ─── getJobById ───────────────────────────────────────────────────────────────
describe("getJobById", () => {
  it("returns a job when ID matches", async () => {
    const jobs = [makeJob({ id: "target-123" })];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { getJobById } = await import("../jobs-loader");
    const result = await getJobById("target-123");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("target-123");
  });

  it("returns null when ID does not exist", async () => {
    const jobs = [makeJob({ id: "existing" })];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { getJobById } = await import("../jobs-loader");
    const result = await getJobById("does-not-exist");

    expect(result).toBeNull();
  });
});

// ─── getTotalJobCount ─────────────────────────────────────────────────────────
describe("getTotalJobCount", () => {
  it("returns total count with no query", async () => {
    const jobs = Array.from({ length: 42 }, (_, i) => makeJob({ id: `${i}` }));
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { getTotalJobCount } = await import("../jobs-loader");
    const count = await getTotalJobCount();

    expect(count).toBe(42);
  });

  it("returns filtered count when query is provided", async () => {
    const jobs = [
      makeJob({ title: "React Developer" }),
      makeJob({ title: "Vue Developer" }),
      makeJob({ title: "React Native Developer" }),
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { getTotalJobCount } = await import("../jobs-loader");
    const count = await getTotalJobCount("react");

    expect(count).toBe(2);
  });
});

// ─── clearCache ────────────────────────────────────────────────────────────────
describe("clearCache", () => {
  it("forces a fresh file read after cache is cleared", async () => {
    const jobs = [makeJob()];
    mockFs.readFile.mockResolvedValue(JSON.stringify(jobs) as any);

    const { loadAllJobs, clearCache } = await import("../jobs-loader");
    await loadAllJobs(); // primes the cache
    clearCache();
    await loadAllJobs(); // should re-read

    expect(mockFs.readFile).toHaveBeenCalledTimes(2);
  });
});
