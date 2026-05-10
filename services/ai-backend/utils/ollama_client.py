"""Ollama client wrapper"""
import ollama
from typing import Optional, Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

class OllamaClient:
    """Wrapper for Ollama API calls"""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.client = ollama.Client(host=self.base_url)
    
    def generate(
        self, 
        prompt: str, 
        model: str = "gemma3",
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> str:
        """
        Generate text using Ollama
        
        Args:
            prompt: User prompt
            model: Model name (default: gemma3)
            system: System prompt (optional)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
        
        Returns:
            Generated text
        """
        try:
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            
            response = self.client.chat(
                model=model,
                messages=messages,
                options={
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    **kwargs
                }
            )
            
            return response['message']['content']
        
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            raise
    
    def generate_structured(
        self,
        prompt: str,
        model: str = "gemma3",
        system: Optional[str] = None,
        format: str = "json",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate structured output (JSON)
        
        Args:
            prompt: User prompt
            model: Model name
            system: System prompt
            format: Output format (default: json)
        
        Returns:
            Parsed JSON dict
        """
        import json
        
        # Append format instruction
        if format == "json":
            prompt += "\n\nRespond with valid JSON only. No markdown code blocks."
        
        response_text = self.generate(
            prompt=prompt,
            model=model,
            system=system,
            **kwargs
        )
        
        # Clean up response (remove markdown fences if present)
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}\nResponse: {response_text}")
            raise
    
    def check_health(self) -> bool:
        """Check if Ollama is running and responsive"""
        try:
            self.client.list()
            return True
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False
    
    def list_models(self) -> list:
        """List available models"""
        try:
            response = self.client.list()
            return response.get('models', [])
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []
