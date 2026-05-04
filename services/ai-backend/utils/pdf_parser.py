"""PDF text extraction utilities"""
import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF bytes using PyMuPDF
    
    Args:
        pdf_bytes: PDF file as bytes
    
    Returns:
        Extracted text as string
    """
    try:
        # Open PDF from bytes
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            text_parts.append(text)
        
        doc.close()
        
        # Join all pages
        full_text = "\n\n".join(text_parts)
        
        # Basic cleanup
        full_text = full_text.strip()
        
        logger.info(f"Extracted {len(full_text)} characters from PDF ({len(doc)} pages)")
        
        return full_text
    
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
