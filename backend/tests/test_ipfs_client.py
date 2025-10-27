import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from ipfs_client import upload_json, get_json, check_health, IPFSClientError


@pytest.mark.asyncio
async def test_upload_json_success():
    """Test successful JSON upload to IPFS"""
    with patch("ipfs_client.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json = MagicMock(return_value={"Hash": "QmTestCID123"})
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        data = {"event": "test", "confidence": 0.95}
        cid = await upload_json(data)
        
        assert cid == "QmTestCID123"


@pytest.mark.asyncio
async def test_upload_json_no_cid():
    """Test error when no CID in response"""
    with patch("ipfs_client.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {}
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        try:
            await upload_json({"test": "data"})
            assert False, "Should have raised IPFSClientError"
        except IPFSClientError as e:
            assert "No CID" in str(e)


@pytest.mark.asyncio
async def test_get_json_success():
    """Test successful JSON retrieval from IPFS"""
    with patch("ipfs_client.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json = MagicMock(return_value={"event": "test", "confidence": 0.95})
        
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        data = await get_json("QmTestCID")
        
        assert data["event"] == "test"
        assert data["confidence"] == 0.95


@pytest.mark.asyncio
async def test_check_health_success():
    """Test IPFS health check"""
    with patch("ipfs_client.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        is_healthy = await check_health()
        assert is_healthy is True


@pytest.mark.asyncio
async def test_check_health_failure():
    """Test IPFS health check failure"""
    with patch("ipfs_client.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(side_effect=Exception("Connection error"))
        
        is_healthy = await check_health()
        assert is_healthy is False
