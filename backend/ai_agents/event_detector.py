import os
from typing import Dict, Any

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class EventDetectorAgent:
    """Detects and identifies trending or relevant real-world events"""
    
    def __init__(self):
        self.api_key = os.environ.get('OPENAI_API_KEY', '')
        if not self.api_key or self.api_key == 'your-openai-api-key-here' or not OPENAI_AVAILABLE:
            # Use mock mode if no API key provided
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.client = AsyncOpenAI(api_key=self.api_key)
            self.system_message = "You are an expert event detector for a prediction market platform. Analyze events and identify key details, context, and potential outcomes."
    
    async def detect(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Detect event details and context"""
        
        if self.mock_mode:
            return {
                "event_id": event.get('id'),
                "detected_category": event.get('category', 'general'),
                "key_details": f"Event: {event.get('event_title')}",
                "context": event.get('event_description'),
                "potential_outcomes": ["Yes", "No"],
                "data_sources": ["reuters.com", "espn.com", "coindesk.com"]
            }
        
        try:
            prompt = f"""
Analyze this event and provide detailed detection results:

Title: {event.get('event_title')}
Description: {event.get('event_description')}
Category: {event.get('category')}

Provide:
1. Key details about the event
2. Relevant context
3. Potential outcomes
4. Suggested data sources to verify

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
                "event_id": event.get('id'),
                "detected_category": event.get('category'),
                "analysis": response.choices[0].message.content,
                "data_sources": ["reuters.com", "espn.com", "coindesk.com"]
            }
        except Exception as e:
            # Fallback to mock
            return {
                "event_id": event.get('id'),
                "detected_category": event.get('category', 'general'),
                "key_details": f"Event: {event.get('event_title')}",
                "context": event.get('event_description'),
                "potential_outcomes": ["Yes", "No"],
                "data_sources": ["reuters.com", "espn.com", "coindesk.com"],
                "error": str(e)
            }