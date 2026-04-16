export const JobStatus = {
  WISHLIST: "WISHLIST",
  APPLIED: "APPLIED",
  PHONE_SCREEN: "PHONE_SCREEN",
  INTERVIEW: "INTERVIEW",
  TECHNICAL: "TECHNICAL",
  OFFER: "OFFER",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  DISCARDED: "DISCARDED",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const AiScore = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  F: "F",
} as const;

export type AiScore = (typeof AiScore)[keyof typeof AiScore];

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobUrl: string | null;
  description: string | null;
  notes: string | null;
  status: JobStatus;
  appliedAt: Date;
  updatedAt: Date;
  userId: string;
  aiScore: AiScore | null;
  offerBase?: number | null;
  offerEquity?: string | null;
  offerBonus?: number | null;
  offerBenefits?: string | null;
  offerStartDate?: Date | null;
  offerExpiresAt?: Date | null;
};

export type TimelineEvent = {
  id: string;
  eventType: string;
  description: string | null;
  eventDate: Date;
  jobApplicationId: string;
};

export type UserProfile = Record<string, any>;
export type StoryBankEntry = {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection?: string | null;
  tags: string[];
  impact?: string | null;
  usedInJobIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type AiEvaluation = {
  id: string;
  jobApplicationId: string;
  score: AiScore;
  scoreNumeric: number;
  summary: string;
  cvMatchPercent?: number | null;
  keyGaps: string[];
  keyStrengths: string[];
  compensationSignal?: string | null;
  fullReport: Record<string, any>;
  companyResearch?: Record<string, any> | null;
  personalizationPlan?: Record<string, any> | null;
  modelUsed: string;
  promptVersion: number;
  generatedAt: Date;
  expiresAt?: Date | null;
};

export type InterviewPrepPackage = {
  id: string;
  jobApplicationId: string;
  companyResearch?: Record<string, any> | null;
  predictedQuestions?: Array<Record<string, any>> | null;
  suggestedStories?: Array<Record<string, any>> | null;
  prepNotes?: string | null;
  lastExportedAt?: Date | null;
  generatedAt: Date;
  updatedAt: Date;
};
