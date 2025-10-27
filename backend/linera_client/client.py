import os
import time
import asyncio
import httpx
from typing import Dict, List

LINERA_SERVICE_URL = os.getenv("LINERA_TESTNET_SERVICE_URL", "https://rpc.testnet.linera.net")
ORACLE_APP_ID = os.getenv("LINERA_ORACLEFEED_APP_ID", "")
MAX_RETRIES = 3
TIMEOUT = 30.0


class LineraClientError(Exception):
    pass


async def publish_event(
    event_id: str,
    payload_hash: str,
    confidence: float,
    sources: List[str],
    cid: str
) -> Dict[str, str]:
    """
    Publish event to OracleFeed contract on Linera testnet.
    
    Returns:
        dict: {"tx_hash": str, "chain_id": str}
    """
    if not ORACLE_APP_ID:
        raise LineraClientError("LINERA_ORACLEFEED_APP_ID not configured")
    
    # Get default chain ID from wallet (mock for now)
    chain_id = os.getenv("LINERA_CHAIN_ID", "default_chain")
    
    graphql_url = f"{LINERA_SERVICE_URL}/chains/{chain_id}/applications/{ORACLE_APP_ID}"
    
    mutation = """
    mutation PublishEvent($eventId: String!, $payloadHash: String!, $confidence: Float!, $sources: [String!]!, $cid: String!) {
        publishEvent(
            eventId: $eventId,
            payloadHash: $payloadHash,
            confidence: $confidence,
            sources: $sources,
            cid: $cid
        )
    }
    """
    
    variables = {
        "eventId": event_id,
        "payloadHash": payload_hash,
        "confidence": confidence,
        "sources": sources,
        "cid": cid
    }
    
    payload = {
        "query": mutation,
        "variables": variables
    }
    
    # Retry with exponential backoff
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.post(
                    graphql_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "errors" in data:
                        raise LineraClientError(f"GraphQL error: {data['errors']}")
                    
                    # Mock tx_hash from response
                    tx_hash = f"tx_{event_id}_{int(time.time())}"
                    
                    return {
                        "tx_hash": tx_hash,
                        "chain_id": chain_id
                    }
                elif response.status_code >= 500:
                    # Retry on server errors
                    if attempt < MAX_RETRIES - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise LineraClientError(f"Server error: {response.status_code}")
                else:
                    raise LineraClientError(f"HTTP {response.status_code}: {response.text}")
                    
        except httpx.TimeoutException:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            raise LineraClientError("Request timeout")
        except httpx.RequestError as e:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            raise LineraClientError(f"Request failed: {str(e)}")
    
    raise LineraClientError("Max retries exceeded")


async def get_block_height() -> int:
    """Get current block height from Linera testnet."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{LINERA_SERVICE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                return data.get("block_height", 0)
    except Exception:
        pass
    return 0
