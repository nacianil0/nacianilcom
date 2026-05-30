import { z } from 'zod';

export const VisibilitySchema = z.enum(['public', 'pdf', 'private']);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const ContactItemSchema = z.object({
  key: z.string(),
  value: z.string(),
  visibility: VisibilitySchema,
});
export type ContactItem = z.infer<typeof ContactItemSchema>;

export const BasicsSchema = z.object({
  name: z.string(),
  title: z.string(),
  summary: z.string(),
  photo: z.string().optional(),
  location: z.string().optional(),
});
export type Basics = z.infer<typeof BasicsSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
  highlights: z.array(z.string()),
  stack: z.array(z.string()),
  visibility: VisibilitySchema,
  needsReview: z.boolean().optional(),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  year: z.number().int().optional(),
  visibility: VisibilitySchema,
  needsReview: z.boolean().optional(),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const SkillGroupSchema = z.object({
  group: z.string(),
  items: z.array(z.string()),
});
export type SkillGroup = z.infer<typeof SkillGroupSchema>;

export const ProjectSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  caseSlug: z.string().optional(),
  stack: z.array(z.string()),
  visibility: VisibilitySchema,
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export const LinkItemSchema = z.object({
  label: z.string(),
  url: z.string(),
  visibility: VisibilitySchema,
});
export type LinkItem = z.infer<typeof LinkItemSchema>;

export const CredentialSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  year: z.number().int().optional(),
  sourcePath: z.string().optional(),
  visibility: VisibilitySchema,
  needsReview: z.boolean().optional(),
});
export type Credential = z.infer<typeof CredentialSchema>;

export const ResumeSchema = z.object({
  basics: BasicsSchema,
  contact: z.array(ContactItemSchema),
  experience: z.array(ExperienceItemSchema),
  education: z.array(EducationItemSchema),
  skills: z.array(SkillGroupSchema),
  projects: z.array(ProjectSummarySchema),
  links: z.array(LinkItemSchema),
  credentials: z.array(CredentialSchema),
});
export type Resume = z.infer<typeof ResumeSchema>;

export const BilingualResumeSchema = z.object({
  tr: ResumeSchema,
  en: ResumeSchema,
});
export type BilingualResume = z.infer<typeof BilingualResumeSchema>;

// ─── Case Study ───────────────────────────────────────────────────────────────

export const CaseStudyAssetSchema = z.object({
  type: z.enum(['image', 'diagram', 'link']),
  url: z.string(),
  caption: z.string().optional(),
  alt: z.string().optional(),
});
export type CaseStudyAsset = z.infer<typeof CaseStudyAssetSchema>;

export const CaseStudySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  problem: z.string(),
  context: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  constraints: z.string().optional(),
  solution: z.string(),
  impact: z.string(),
  assets: z.array(CaseStudyAssetSchema),
  visibility: VisibilitySchema,
  needsReview: z.boolean().optional(),
});
export type CaseStudy = z.infer<typeof CaseStudySchema>;

export const BilingualCaseStudySchema = z.object({
  tr: CaseStudySchema,
  en: CaseStudySchema,
});
export type BilingualCaseStudy = z.infer<typeof BilingualCaseStudySchema>;
