"""CV tailoring prompt for Ollama"""

def build_cv_tailoring_prompt(profile, work_exp, education, skills, projects, job_data):
    """
    Build prompt for tailoring CV content
    
    Args:
        profile: User profile dict
        work_exp: List of work experience tuples
        education: List of education tuples
        skills: List of skill tuples
        projects: List of project tuples
        job_data: Job description dict
    
    Returns:
        Formatted prompt string
    """
    
    # Format work experience
    work_section = []
    for exp in work_exp:
        company, title, location, start_date, end_date, is_current, description, achievements, technologies = exp
        date_range = f"{start_date} - {'Present' if is_current else (end_date or 'Present')}"
        work_section.append(f"""
{company} | {title} | {date_range}
Location: {location or 'N/A'}
Description: {description or 'N/A'}
Achievements: {', '.join(achievements) if achievements else 'None listed'}
Technologies: {', '.join(technologies) if technologies else 'None listed'}
""")
    
    # Format education
    edu_section = []
    for edu in education:
        institution, degree, field, start_date, end_date, gpa, honors = edu
        edu_section.append(f"{institution} | {degree} in {field or 'N/A'} | {start_date} - {end_date} | GPA: {gpa or 'N/A'}")
    
    # Format skills by category
    skills_by_cat = {}
    for skill in skills:
        name, category, proficiency, years = skill
        if category not in skills_by_cat:
            skills_by_cat[category] = []
        skills_by_cat[category].append(f"{name} ({proficiency or 'N/A'}, {years or 'N/A'} years)")
    
    skills_section = []
    for cat, skill_list in skills_by_cat.items():
        skills_section.append(f"{cat}: {', '.join(skill_list)}")
    
    # Format projects
    projects_section = []
    for proj in projects:
        name, description, technologies, url, highlights = proj
        projects_section.append(f"""
{name}
Description: {description or 'N/A'}
Technologies: {', '.join(technologies) if technologies else 'N/A'}
URL: {url or 'N/A'}
Highlights: {', '.join(highlights) if highlights else 'None'}
""")
    
    prompt = f"""You are a professional CV writer helping a candidate tailor their resume for a specific job.

TARGET JOB:
Company: {job_data['company']}
Position: {job_data['position']}
Location: {job_data.get('location', 'N/A')}

JOB DESCRIPTION:
{job_data['description']}

CANDIDATE PROFILE:
Headline: {profile.get('headline', 'N/A')}
Target Roles: {', '.join(profile.get('primaryRoles', []))}
Seniority: {profile.get('seniority', 'N/A')}
Key Strengths:
- {profile.get('superpower1', 'N/A')}
- {profile.get('superpower2', 'N/A')}
- {profile.get('superpower3', 'N/A')}

WORK EXPERIENCE:
{''.join(work_section)}

EDUCATION:
{chr(10).join(edu_section)}

SKILLS:
{chr(10).join(skills_section)}

PROJECTS:
{''.join(projects_section)}

INSTRUCTIONS:
1. Rewrite the WORK EXPERIENCE section to emphasize skills and experiences most relevant to the target job
2. Reorder and rephrase achievement bullets to highlight relevant accomplishments
3. Add specific metrics and impact where appropriate
4. Ensure ATS (Applicant Tracking System) compatibility by including keywords from the job description
5. Keep a professional, confident tone
6. De-emphasize irrelevant experiences
7. Format for maximum readability

OUTPUT FORMAT:
Return ONLY the tailored CV content in this exact markdown structure:

# [Candidate Name]
[Professional Headline]

Location: [Location] | Email: [email] | LinkedIn: [URL]

## PROFESSIONAL SUMMARY
[3-4 line summary tailored to this specific role]

## WORK EXPERIENCE

### [Company Name] | [Tailored Job Title] | [Date Range]
**Location:** [Location]

- [Tailored achievement bullet with metrics]
- [Tailored achievement bullet with metrics]
- [Tailored achievement bullet with metrics]

[Repeat for each relevant position]

## EDUCATION

### [Institution] | [Degree] in [Field] | [Graduation Date]
[GPA if notable, honors, relevant coursework]

## TECHNICAL SKILLS

**[Category]:** [Skills prioritized by relevance to job]

## PROJECTS

### [Project Name]
[Tailored description emphasizing relevant technologies]

Remember: Tailor everything to match the job requirements. Use keywords from the job description. Highlight quantifiable achievements.
"""
    
    return prompt
