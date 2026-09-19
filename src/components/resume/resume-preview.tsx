"use client";

import { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";

interface ResumePreviewProps {
  data: ResumeData;
  template?: "modern" | "classic" | "minimal";
}

export function ResumePreview({ data, template = "modern" }: ResumePreviewProps) {
  const { personal, experience, education, skills, projects, certifications, achievements } = data;

  if (template === "classic") {
    return <ClassicTemplate data={data} />;
  }
  if (template === "minimal") {
    return <MinimalTemplate data={data} />;
  }
  return <ModernTemplate data={data} />;
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const { personal, experience, education, skills, projects, certifications, achievements } = data;

  const skillCategories = data.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof data.skills>);

  return (
    <div className="bg-white text-gray-900 p-8 md:p-12 max-w-3xl mx-auto font-sans leading-relaxed" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-primary">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{personal.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-3">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span><a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a></span>}
          {personal.portfolio && <span><a href={personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portfolio</a></span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </span>
            Professional Summary
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </span>
            Experience
          </h2>
          <div className="space-y-5">
            {experience.map((exp, index) => (
              <div key={exp.id} className="pl-4 border-l-2 border-primary/20">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-primary font-medium">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">{exp.location}</p>
                {exp.description && <p className="text-gray-700 whitespace-pre-wrap">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </span>
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id} className="pl-4 border-l-2 border-primary/20">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-primary font-medium">{edu.institution}</p>
                <p className="text-sm text-gray-500">{edu.location} • {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                {edu.description && <p className="text-gray-700 mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </span>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              data.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof data.skills>)
            ).map(([category, skills]) => (
              <div key={category} className="mb-3">
                <h4 className="text-sm font-medium text-gray-500 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {skill.name}
                      <span className="px-1.5 py-0.5 rounded text-xs bg-primary/20">{skill.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </span>
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={project.id} className="pl-4 border-l-2 border-primary/20">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Project</a>}
                </div>
                <p className="text-gray-700 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{tech.trim()}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Certifications
          </h2>
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-500">{cert.issuer} • {formatDate(cert.date)}{cert.expiryDate ? ` • Expires ${formatDate(cert.expiryDate)}` : ""}</p>
                  {cert.credentialId && <p className="text-xs text-gray-400">Credential: {cert.credentialId}</p>}
                </div>
                {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Verify</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Achievements
          </h2>
          <div className="space-y-3">
            {achievements.map((ach, index) => (
              <div key={ach.id} className="pl-4 border-l-2 border-primary/20">
                <h3 className="font-semibold text-gray-900">{ach.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(ach.date)}</p>
                {ach.description && <p className="text-gray-700 mt-1">{ach.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personal, experience, education, skills } = data;

  return (
    <div className="bg-white text-gray-900 p-8 md:p-12 max-w-3xl mx-auto font-serif leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{personal.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-sm mb-3">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span><a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">LinkedIn</a></span>}
        </div>
      </div>

      {personal.summary && (
        <div className="mb-8 text-justify">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">Professional Summary</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{personal.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Professional Experience</h2>
          <div className="space-y-5">
            {experience.map((exp, index) => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{exp.location}</p>
                {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Education</h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id}>
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-600">{edu.institution}, {edu.location}</p>
                <p className="text-sm text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Technical Skills</h2>
          <div className="space-y-2">
            {Object.entries(
              data.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof data.skills>)
            ).map(([category, skills]) => (
              <p key={category} className="text-gray-700">
                <span className="font-semibold">{category}:</span> {skills.map(s => `${s.name} (${s.level})`).join(", ")}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personal, experience, education, skills } = data;

  return (
    <div className="bg-white text-gray-900 p-8 md:p-12 max-w-3xl mx-auto font-mono text-sm leading-relaxed" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{personal.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-4 text-gray-500 text-xs">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.portfolio && <span>{personal.portfolio}</span>}
        </div>
      </div>

      {personal.summary && (
        <div className="mb-6">
          <h2 className="font-bold mb-2">// SUMMARY</h2>
          <p className="text-gray-600">{personal.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold mb-3">// EXPERIENCE</h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={exp.id} className="pl-4 border-l border-gray-300">
                <div className="flex justify-between">
                  <div>
                    <span className="font-bold">{exp.title}</span>
                    <span className="text-gray-500 ml-2">@ {exp.company}</span>
                  </div>
                  <span className="text-gray-400">{formatDate(exp.startDate)} - {exp.current ? "present" : formatDate(exp.endDate)}</span>
                </div>
                <span className="text-gray-400 text-xs">{exp.location}</span>
                {exp.description && <p className="mt-1 text-gray-600">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold mb-3">// EDUCATION</h2>
          <div className="space-y-2">
            {education.map((edu, index) => (
              <div key={edu.id} className="pl-2 border-l border-gray-200">
                <span className="font-bold">{edu.degree}</span>
                <span className="text-gray-500 ml-2">@ {edu.institution}</span>
                <span className="text-gray-400 ml-2">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h2 className="font-bold mb-3">// SKILLS</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map(skill => (
              <span key={skill.id} className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200">
                {skill.name} <span className="text-gray-400">({skill.level})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}