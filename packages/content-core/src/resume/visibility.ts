import type { Resume, Visibility } from '../schemas/resume';

type FilterMode = 'web' | 'pdf';

function passes(visibility: Visibility, mode: FilterMode): boolean {
  if (visibility === 'private') return false;
  if (visibility === 'pdf' && mode === 'web') return false;
  return true;
}

export function filterResumeByVisibility(resume: Resume, mode: FilterMode): Resume {
  const earlierExperience =
    resume.earlierExperience && passes(resume.earlierExperience.visibility, mode)
      ? resume.earlierExperience
      : undefined;

  return {
    basics: resume.basics,
    contact: resume.contact.filter(c => passes(c.visibility, mode)),
    experience: resume.experience.filter(e => passes(e.visibility, mode)),
    ...(earlierExperience ? { earlierExperience } : {}),
    education: resume.education.filter(e => passes(e.visibility, mode)),
    skills: resume.skills,
    projects: resume.projects.filter(p => passes(p.visibility, mode)),
    links: resume.links.filter(l => passes(l.visibility, mode)),
    credentials: resume.credentials.filter(c => passes(c.visibility, mode)),
  };
}
