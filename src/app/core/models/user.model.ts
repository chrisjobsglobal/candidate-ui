export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: 'jobseeker' | 'recruiter' | 'admin';
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSeeker extends User {
  role: 'jobseeker';
  profile: JobSeekerProfile;
  applications: UserApplication[];
  connections: Connection[];
  savedJobs: string[];
}

export interface Recruiter extends User {
  role: 'recruiter';
  company: UserCompany;
  postedJobs: UserJob[];
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
