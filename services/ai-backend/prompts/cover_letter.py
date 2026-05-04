"""Cover letter generation prompt"""

def build_cover_letter_prompt(data):
    """
    Build prompt for cover letter generation
    
    Args:
        data: Tuple (headline, primaryRoles, seniority, superpower1, company, position, description)
    
    Returns:
        Formatted prompt string
    """
    headline, primary_roles, seniority, superpower, company, position, description = data
    
    prompt = f"""Write a professional cover letter for this candidate applying to this job.

CANDIDATE:
Headline: {headline or 'Experienced professional'}
Target Roles: {', '.join(primary_roles) if primary_roles else 'N/A'}
Seniority: {seniority or 'N/A'}
Key Strength: {superpower or 'N/A'}

JOB:
Company: {company}
Position: {position}

Description:
{description}

Write a compelling 3-paragraph cover letter:
1. Opening: Why you're excited about this role and company
2. Body: How your experience aligns with their needs
3. Closing: Call to action

Tone: Professional but personable. Confident but not arrogant.
Length: 250-350 words.
Format: Plain text, ready to copy-paste.

Start writing now:
"""
    
    return prompt
