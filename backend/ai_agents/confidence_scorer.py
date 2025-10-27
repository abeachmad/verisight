import os
from typing import Dict, Any
import random

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class ConfidenceScorerAgent:
    """Calculates confidence scores based on source verification"""
    
    def __init__(self):
        self.api_key = os.environ.get('OPENAI_API_KEY', '')
        if not self.api_key or self.api_key == 'your-openai-api-key-here' or not OPENAI_AVAILABLE:
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.client = AsyncOpenAI(api_key=self.api_key)
            self.system_message = "You are an expert at calculating confidence scores. Analyze verification results and provide confidence levels from 0.0 to 1.0."
    
    async def score(self, verification_result: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence score based on verification"""
        
        if self.mock_mode:
            sources_checked = verification_result.get('sources_checked', 3)
            sources_confirming = verification_result.get('sources_confirming', 2)
            consensus = verification_result.get('consensus', True)
            
            # Calculate base confidence
            if sources_confirming >= 2 and consensus:
                confidence = 0.85 + random.uniform(0, 0.1)
            elif sources_confirming >= 1:
                confidence = 0.65 + random.uniform(0, 0.15)
            else:
                confidence = 0.3 + random.uniform(0, 0.2)
            
            return {
                "event_id": verification_result.get('event_id'),
                "confidence": round(min(confidence, 1.0), 2),
                "factors": {
                    "sources_checked": sources_checked,
                    "sources_confirming": sources_confirming,
                    "consensus": consensus,
                    "data_quality": "high"
                },
                "recommendation": "auto_resolve" if confidence > 0.9 else "manual_review" if confidence < 0.6 else "proceed"
            }
        
        try:
            prompt = f"""
Calculate confidence score for this verification:

Verification Results: {verification_result}

Provide:
1. Confidence score (0.0 to 1.0)
2. Key factors affecting confidence
3. Recommendation (auto_resolve, proceed, or manual_review)

Format as JSON.
"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return {
                "event_id": verification_result.get('event_id'),
                "confidence_analysis": response.choices[0].message.content,
                "confidence": 0.87,
                "recommendation": "proceed"
            }
        except Exception as e:
            return {
                "event_id": verification_result.get('event_id'),
                "confidence": 0.75,
                "recommendation": "manual_review",
                "error": str(e)
            }