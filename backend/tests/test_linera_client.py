import pytest
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_publish_event_success():
    """Test successful event publication"""
    with patch.dict("os.environ", {"LINERA_ORACLEFEED_APP_ID": "test_app_id", "LINERA_CHAIN_ID": "test_chain"}):
        from linera_client.client import publish_event
        
        with patch("linera_client.client.httpx.AsyncClient") as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"data": {"publishEvent": "success"}}
            
            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post
            
            result = await publish_event(
                event_id="test_event",
                payload_hash="abc123",
                confidence=0.95,
                sources=["source1", "source2"],
                cid="QmTest"
            )
            
            assert "tx_hash" in result
            assert "chain_id" in result


@pytest.mark.asyncio
async def test_publish_event_no_app_id():
    """Test error when APP_ID not configured"""
    with patch("linera_client.client.ORACLE_APP_ID", ""):
        from linera_client.client import publish_event, LineraClientError
        
        with pytest.raises(LineraClientError, match="not configured"):
            await publish_event(
                event_id="test",
                payload_hash="hash",
                confidence=0.9,
                sources=["s1"],
                cid="cid"
            )


@pytest.mark.asyncio
async def test_publish_event_retry_on_server_error():
    """Test retry logic on server errors"""
    with patch.dict("os.environ", {"LINERA_ORACLEFEED_APP_ID": "test_app_id"}):
        from linera_client.client import publish_event, LineraClientError
        
        with patch("linera_client.client.httpx.AsyncClient") as mock_client, \
             patch("linera_client.client.asyncio.sleep", new_callable=AsyncMock):
            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_response.text = "Server error"
            
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
            
            with pytest.raises(LineraClientError, match="Server error"):
                await publish_event(
                    event_id="test",
                    payload_hash="hash",
                    confidence=0.9,
                    sources=["s1"],
                    cid="cid"
                )


@pytest.mark.asyncio
async def test_get_block_height():
    """Test getting block height"""
    from linera_client.client import get_block_height
    
    with patch("linera_client.client.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"block_height": 12345}
        
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        height = await get_block_height()
        assert height == 12345
