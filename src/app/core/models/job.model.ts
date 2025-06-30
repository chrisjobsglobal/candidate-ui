export interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salaryRange: SalaryRange;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits: string[];
  applicationDeadline?: Date;
  isActive: boolean;
  postedBy: string; // User ID
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'annually';
}

export interface Application {
  id: string;
  jobId: string;
  jobSeekerId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  resumeUrl?: string;
  customAnswers: ApplicationAnswer[];
  appliedAt: Date;
  updatedAt: Date;
  notes?: string; // Internal recruiter notes
}

export interface ApplicationAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface Shortlist {
  id: string;
  jobId: string;
  jobSeekerId: string;
  recruiterId: string;
  status: 'shortlisted' | 'moved-forward' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  location: string;
  foundedYear?: number;
  benefits: string[];
  culture: string[];
  socialLinks: SocialLinks;
  isVerified: boolean;
  createdAt: Date;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}
