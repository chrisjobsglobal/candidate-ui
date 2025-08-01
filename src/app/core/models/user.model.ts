export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  mobile: string;
  address: string;
  country: string;
  avatar_url?: string;
  cover_photo?: string;
  is_hiring: boolean;
  is_open_to_work: boolean;
  job_title: string;
  company: string;
  work_status_message: string;
  profile_tag: string;
  is_active: boolean;
  created_at: string; // Using string to match API format, can be converted to Date when needed
  updated_at: string;
  last_login: string;
  last_seen: string;
  is_verified: boolean;
  is_online: boolean;
  website?: string; // Optional field for user's personal website
}

export interface JobSeeker extends User {
  // Additional JobSeeker-specific properties can be added here
  profile?: JobSeekerProfile;
  applications?: UserApplication[];
  connections?: Connection[];
  savedJobs?: string[];
}

export interface Recruiter extends User {
  // Additional Recruiter-specific properties can be added here
  companyDetails?: UserCompany; // Renamed to avoid conflict with base User.company
  postedJobs?: UserJob[];
}

export interface JobSeekerProfile {
  headline: string;
  summary: string;
  location: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isPublic: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateIssued: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface UserApplication {
  id: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  appliedAt: Date;
}

export interface UserCompany {
  id: string;
  name: string;
  logo?: string;
  description: string;
}

export interface UserJob {
  id: string;
  title: string;
  location: string;
  type: string;
}
