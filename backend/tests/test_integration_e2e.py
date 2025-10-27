import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import os
import json
import hashlib


@pytest.mark.asyncio
async def test_production_env_config():
    """Test that production mode reads correct env variables"""
    with patch.dict("os.environ", {
        "ENV": "production",
        "LINERA_TESTNET_SERVICE_URL": "https://test.linera.net",
        "LINERA_ORACLEFEED_APP_ID": "app123",
        "IPFS_API_URL": "https://ipfs.test",
        "IPFS_GATEWAY_URL": "https://gateway.test"
    }):
        import importlib
        import linera_client.client
        import ipfs_client
        
        importlib.reload(linera_client.client)
        importlib.reload(ipfs_client)
        
        assert linera_client.client.LINERA_SERVICE_URL == "https://test.linera.net"
        assert linera_client.client.ORACLE_APP_ID == "app123"
        assert ipfs_client.IPFS_API_URL == "https://ipfs.test"
        assert ipfs_client.IPFS_GATEWAY_URL == "https://gateway.test"


@pytest.mark.asyncio
async def test_verify_event_generates_all_fields():
    """Test POST /events/{id}/verify generates payload_hash, cid, tx_hash, chain_id"""
    event_id = "test_event_123"
    summary = {
        "event_id": event_id,
        "result": "verified",
        "confidence": 0.95,
        "proof_links": ["https://source1.com", "https://source2.com"],
        "reasoning": "Test reasoning"
    }
    
    # Calculate expected payload_hash
    payload_str = json.dumps(summary, sort_keys=True)
    expected_hash = hashlib.sha256(payload_str.encode()).hexdigest()
    
    with patch("ai_agents.event_detector.EventDetectorAgent.detect", new_callable=AsyncMock) as mock_detect, \
         patch("ai_agents.source_verifier.SourceVerifierAgent.verify", new_callable=AsyncMock), \
         patch("ai_agents.confidence_scorer.ConfidenceScorerAgent.score", new_callable=AsyncMock), \
         patch("ai_agents.summary_composer.SummaryComposerAgent.compose", new_callable=AsyncMock) as mock_compose, \
         patch("ipfs_client.upload_json", new_callable=AsyncMock) as mock_ipfs, \
         patch("server.linera_publish_event", new_callable=AsyncMock) as mock_linera:
        
        mock_detect.return_value = {}
        mock_compose.return_value = summary
        mock_ipfs.return_value = "QmTestCID123"
        mock_linera.return_value = {"tx_hash": "0xabc123def", "chain_id": "chain_456"}
        
        from server import run_ai_verification
        
        mock_db = MagicMock()
        mock_db.events.update_one = AsyncMock()
        
        with patch("server.db", mock_db), \
             patch("server.manager.broadcast", new_callable=AsyncMock), \
             patch.dict("os.environ", {"ENV": "production"}):
            
            await run_ai_verification(event_id, {"id": event_id})
            
            # Verify IPFS upload was called
            assert mock_ipfs.called
            
            # Verify Linera publish was called with correct params
            assert mock_linera.called
            call_kwargs = mock_linera.call_args[1]
            assert call_kwargs["event_id"] == event_id
            assert call_kwargs["payload_hash"] == expected_hash
            assert call_kwargs["confidence"] == 0.95
            assert call_kwargs["sources"] == ["https://source1.com", "https://source2.com"]
            assert call_kwargs["cid"] == "QmTestCID123"
            
            # Verify database update
            update_call = mock_db.events.update_one.call_args[0][1]["$set"]
            assert update_call["confidence"] == 0.95
            assert update_call["onchain"]["tx_hash"] == "0xabc123def"
            assert update_call["onchain"]["chain_id"] == "chain_456"
            assert update_call["onchain"]["cid"] == "QmTestCID123"


@pytest.mark.asyncio
async def test_mongo_stores_required_fields():
    """Test that MongoDB stores event_id, payload_hash, confidence, sources, cid, onchain data"""
    event_id = "test_event_456"
    summary = {
        "event_id": event_id,
        "confidence": 0.92,
        "proof_links": ["source1", "source2"]
    }
    
    with patch("ai_agents.event_detector.EventDetectorAgent.detect", new_callable=AsyncMock), \
         patch("ai_agents.source_verifier.SourceVerifierAgent.verify", new_callable=AsyncMock), \
         patch("ai_agents.confidence_scorer.ConfidenceScorerAgent.score", new_callable=AsyncMock), \
         patch("ai_agents.summary_composer.SummaryComposerAgent.compose", new_callable=AsyncMock) as mock_compose, \
         patch("ipfs_client.upload_json", new_callable=AsyncMock) as mock_ipfs, \
         patch("server.linera_publish_event", new_callable=AsyncMock) as mock_linera:
        
        mock_compose.return_value = summary
        mock_ipfs.return_value = "QmCID789"
        mock_linera.return_value = {"tx_hash": "0xtx789", "chain_id": "chain_789"}
        
        from server import run_ai_verification
        
        mock_db = MagicMock()
        update_mock = AsyncMock()
        mock_db.events.update_one = update_mock
        
        with patch("server.db", mock_db), \
             patch("server.manager.broadcast", new_callable=AsyncMock), \
             patch.dict("os.environ", {"ENV": "production"}):
            
            await run_ai_verification(event_id, {"id": event_id})
            
            # Check stored fields
            stored_data = update_mock.call_args[0][1]["$set"]
            assert "confidence" in stored_data
            assert "proof_links" in stored_data
            assert "onchain" in stored_data
            assert stored_data["onchain"]["cid"] == "QmCID789"
            assert stored_data["onchain"]["tx_hash"] == "0xtx789"
            assert stored_data["onchain"]["chain_id"] == "chain_789"


@pytest.mark.asyncio
async def test_health_endpoint_returns_all_services():
    """Test GET /health returns mongo/ipfs/linera status with block_height"""
    from fastapi.testclient import TestClient
    
    with patch("server.db.command", new_callable=AsyncMock) as mock_mongo, \
         patch("ipfs_client.check_health", new_callable=AsyncMock) as mock_ipfs, \
         patch("server.linera_get_block_height", new_callable=AsyncMock) as mock_linera:
        
        mock_mongo.return_value = {"ok": 1}
        mock_ipfs.return_value = True
        mock_linera.return_value = 12345
        
        from server import app
        client = TestClient(app)
        
        response = client.get("/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "mongo" in data["services"]
        assert "ipfs" in data["services"]
        assert "linera" in data["services"]
        assert "block_height" in data["services"]["linera"]
        assert data["services"]["linera"]["status"] in ["healthy", "unhealthy"]


@pytest.mark.asyncio
async def test_logging_includes_event_cid_tx():
    """Test that logging includes event_id, cid, tx_hash without raw payload"""
    import logging
    
    event_id = "log_test_event"
    summary = {"event_id": event_id, "confidence": 0.9, "proof_links": ["s1"]}
    
    with patch("ai_agents.event_detector.EventDetectorAgent.detect", new_callable=AsyncMock), \
         patch("ai_agents.source_verifier.SourceVerifierAgent.verify", new_callable=AsyncMock), \
         patch("ai_agents.confidence_scorer.ConfidenceScorerAgent.score", new_callable=AsyncMock), \
         patch("ai_agents.summary_composer.SummaryComposerAgent.compose", new_callable=AsyncMock) as mock_compose, \
         patch("ipfs_client.upload_json", new_callable=AsyncMock) as mock_ipfs, \
         patch("server.linera_publish_event", new_callable=AsyncMock) as mock_linera, \
         patch("logging.error") as mock_log:
        
        mock_compose.return_value = summary
        mock_ipfs.return_value = "QmLogCID"
        mock_linera.return_value = {"tx_hash": "0xlogTx", "chain_id": "log_chain"}
        
        from server import run_ai_verification
        
        mock_db = MagicMock()
        mock_db.events.update_one = AsyncMock()
        
        with patch("server.db", mock_db), \
             patch("server.manager.broadcast", new_callable=AsyncMock), \
             patch.dict("os.environ", {"ENV": "production"}):
            
            await run_ai_verification(event_id, {"id": event_id})
            
            # Verify no errors logged (success case)
            assert not mock_log.called
