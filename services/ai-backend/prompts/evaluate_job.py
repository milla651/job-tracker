"""Job evaluation prompt for Ollama"""

def build_job_evaluation_prompt(profile, job):
    """
    Build prompt for job evaluation
    
    Args:
        profile: Tuple (headline, primaryRoles, seniority, targetCompMin, targetCompMax)
        job: Tuple (company, position, description, salaryMin, salaryMax)
    
    Returns:
        Formatted prompt string
    """
    headline, primary_roles, seniority, target_min, target_max = profile
    company, position, description, salary_min, salary_max = job
    
    prompt = f"""You are a career advisor. Evaluate how well this job matches the candidate's profile.

CANDIDATE PROFILE:
Headline: {headline or 'N/A'}
Target Roles: {', '.join(primary_roles) if primary_roles else 'N/A'}
Seniority: {seniority or 'N/A'}
Target Compensation: ${target_min or '?'} - ${target_max or '?'}

JOB POSTING:
Company: {company}
Position: {position}
Salary Range: ${salary_min or '?'} - ${salary_max or '?'}

Description:
{description}

Evaluate and return ONLY valid JSON with this exact structure:
{{
  "score": "A" | "B" | "C" | "D" | "F",
  "score_numeric": 1.0 | 0.8 | 0.6 | 0.4 | 0.2,
  "summary": "one sentence verdict",
  "match_percent": 0-100,
  "key_strengths": ["strength1", "strength2", "strength3"],
  "key_gaps": ["gap1", "gap2"],
  "compensation_signal": "above" | "at" | "below" | "unknown",
  "recommendation": "brief actionable recommendation"
}}

Scoring guide:
A (1.0) = Strong match, apply actively
B (0.8) = Good fit with minor gaps
C (0.6) = Possible stretch
D (0.4) = Significant gaps
F (0.2) = Not aligned
"""
    
    return prompt
