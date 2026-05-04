"""PDF rendering utilities"""
from weasyprint import HTML, CSS
from jinja2 import Template
import logging
import os

logger = logging.getLogger(__name__)

# Simple ATS-friendly CV template
CV_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            padding: 0.75in;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 4pt;
        }
        h2 {
            font-size: 13pt;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
            border-bottom: 1px solid #333;
            padding-bottom: 2pt;
        }
        h3 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 8pt;
            margin-bottom: 4pt;
        }
        p {
            margin-bottom: 6pt;
        }
        ul {
            margin-left: 20pt;
            margin-bottom: 6pt;
        }
        li {
            margin-bottom: 3pt;
        }
        .header {
            text-align: center;
            margin-bottom: 12pt;
        }
        .contact {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 12pt;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    {{ content }}
</body>
</html>
"""

def markdown_to_html(markdown_text: str) -> str:
    """
    Convert simple markdown to HTML
    (Basic implementation - for production, use a proper markdown library)
    """
    html = markdown_text
    
    # Headers
    html = html.replace('### ', '<h3>').replace('\n## ', '</h3>\n<h2>').replace('\n# ', '</h2>\n<h1>')
    
    # Bold
    html = html.replace('**', '<strong>').replace('**', '</strong>')
    
    # Lists (basic)
    lines = html.split('\n')
    in_list = False
    result = []
    for line in lines:
        if line.strip().startswith('- '):
            if not in_list:
                result.append('<ul>')
                in_list = True
            result.append(f'<li>{line.strip()[2:]}</li>')
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            if line.strip():
                result.append(f'<p>{line}</p>')
    
    if in_list:
        result.append('</ul>')
    
    return '\n'.join(result)

def render_cv_to_pdf(content: str, profile: dict, template: str = "classic") -> bytes:
    """
    Render CV content to PDF
    
    Args:
        content: Markdown CV content from LLM
        profile: User profile dict
        template: Template name (default: "classic")
    
    Returns:
        PDF as bytes
    """
    try:
        # Convert markdown to HTML
        html_content = markdown_to_html(content)
        
        # Render template
        template = Template(CV_TEMPLATE)
        html = template.render(content=html_content)
        
        # Generate PDF
        pdf_bytes = HTML(string=html).write_pdf()
        
        logger.info(f"Generated PDF ({len(pdf_bytes)} bytes)")
        
        return pdf_bytes
    
    except Exception as e:
        logger.error(f"PDF rendering failed: {e}")
        raise ValueError(f"Failed to render PDF: {str(e)}")
