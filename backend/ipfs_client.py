import os
import json
import httpx
from typing import Dict, Any

IPFS_API_URL = os.getenv("IPFS_API_URL", "https://ipfs.infura.io:5001")
IPFS_GATEWAY_URL = os.getenv("IPFS_GATEWAY_URL", "https://ipfs.io/ipfs")
TIMEOUT = 30.0


class IPFSClientError(Exception):
    pass


async def upload_json(data: Dict[str, Any]) -> str:
    """
    Upload JSON data to IPFS.
    
    Returns:
        str: CID (Content Identifier)
    """
    try:
        json_str = json.dumps(data, indent=2)
        
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            files = {"file": ("data.json", json_str, "application/json")}
            response = await client.post(
                f"{IPFS_API_URL}/api/v0/add",
                files=files
            )
            
            if response.status_code == 200:
                result = response.json()
                cid = result.get("Hash")
                if not cid:
                    raise IPFSClientError("No CID in response")
                return cid
            else:
                raise IPFSClientError(f"HTTP {response.status_code}: {response.text}")
                
    except httpx.TimeoutException:
        raise IPFSClientError("IPFS upload timeout")
    except httpx.RequestError as e:
        raise IPFSClientError(f"IPFS request failed: {str(e)}")


async def get_json(cid: str) -> Dict[str, Any]:
    """
    Retrieve JSON data from IPFS by CID.
    
    Returns:
        dict: JSON data
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{IPFS_GATEWAY_URL}/{cid}")
            
            if response.status_code == 200:
                return response.json()
            else:
                raise IPFSClientError(f"HTTP {response.status_code}: {response.text}")
                
    except httpx.TimeoutException:
        raise IPFSClientError("IPFS retrieval timeout")
    except httpx.RequestError as e:
        raise IPFSClientError(f"IPFS request failed: {str(e)}")


async def check_health() -> bool:
    """Check if IPFS service is available."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{IPFS_API_URL}/api/v0/version")
            return response.status_code == 200
    except Exception:
        return False
