export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  logo: string; // URL or placeholder
  tags: string[];
  description: string;
  url: string;
}

export const MOCK_JOBS: ScrapedJob[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full-time",
    postedAt: "2h ago",
    logo: "V",
    tags: ["React", "Next.js", "TypeScript"],
    description: "We are looking for an experienced Frontend Engineer to help build the next generation of web development tools...",
    url: "https://vercel.com/careers",
  },
  {
    id: "job-2",
    title: "Product Designer",
    company: "Linear",
    location: "San Francisco, CA",
    salary: "$130k - $170k",
    type: "Full-time",
    postedAt: "5h ago",
    logo: "L",
    tags: ["Figma", "Design Systems", "Product"],
    description: "Join our design team to craft beautiful and performant interfaces for high-performance teams...",
    url: "https://linear.app/careers",
  },
  {
    id: "job-3",
    title: "Backend Engineer",
    company: "Supabase",
    location: "Remote",
    salary: "$150k - $190k",
    type: "Full-time",
    postedAt: "1d ago",
    logo: "S",
    tags: ["PostgreSQL", "Go", "Elixir"],
    description: "Help us build the open source Firebase alternative. You will work on scalable backend systems...",
    url: "https://supabase.com/careers",
  },
  {
    id: "job-4",
    title: "Full Stack Developer",
    company: "Raycast",
    location: "London, UK",
    salary: "£80k - £120k",
    type: "Full-time",
    postedAt: "2d ago",
    logo: "R",
    tags: ["React", "Node.js", "Swift"],
    description: "We are reimagining the way developers interact with their tools. Join us to build productivity superpowers...",
    url: "https://raycast.com/jobs",
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "Neon",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full-time",
    postedAt: "3d ago",
    logo: "N",
    tags: ["Rust", "Kubernetes", "Cloud"],
    description: "Build the future of serverless Postgres. We are looking for engineers who love infrastructure...",
    url: "https://neon.tech/careers",
  },
  {
    id: "job-6",
    title: "Software Engineer, AI",
    company: "OpenAI",
    location: "San Francisco, CA",
    salary: "$200k - $300k",
    type: "Full-time",
    postedAt: "4d ago",
    logo: "O",
    tags: ["Python", "PyTorch", "ML"],
    description: "Work on the frontier of AI research and deployment. Help us build safe and beneficial AGI...",
    url: "https://openai.com/careers",
  },
  {
    id: "job-7",
    title: "Staff Engineer",
    company: "Stripe",
    location: "New York, NY",
    salary: "$220k - $280k",
    type: "Full-time",
    postedAt: "1w ago",
    logo: "S",
    tags: ["Ruby", "Java", "Distributed Systems"],
    description: "Build the financial infrastructure for the internet. We process billions of dollars annually...",
    url: "https://stripe.com/jobs",
  },
  {
    id: "job-8",
    title: "Marketing Manager",
    company: "Notion",
    location: "New York, NY",
    salary: "$120k - $160k",
    type: "Full-time",
    postedAt: "1w ago",
    logo: "N",
    tags: ["Marketing", "Growth", "SaaS"],
    description: "Tell the story of the all-in-one workspace. We are looking for a creative marketer...",
    url: "https://notion.so/careers",
  }
];

export async function getMockJobs(): Promise<ScrapedJob[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_JOBS;
}
