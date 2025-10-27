import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import hashlib
import json


@pytest.mark.asyncio
async def test_verification_flow_production():
    """Test full verification flow in production mode"""
    event_id = "test_event_123"
    event = {
        "id": event_id,
        "event_title": "Test Event",
        "event_description": "Test Description"
    }
    
    summary = {
        "event_id": event_id,
        "result": "verified",
        "confidence": 0.95,
        "proof_links": ["https://source1.com", "https://source2.com"],
        "reasoning": "Test reasoning"
    }
    
    # Mock AI agents
    with patch("ai_agents.event_detector.EventDetectorAgent.detect", new_callable=AsyncMock) as mock_detect, \
         patch("ai_agents.source_verifier.SourceVerifierAgent.verify", new_callable=AsyncMock) as mock_verify, \
         patch("ai_agents.confidence_scorer.ConfidenceScorerAgent.score", new_callable=AsyncMock) as mock_score, \
         patch("ai_agents.summary_composer.SummaryComposerAgent.compose", new_callable=AsyncMock) as mock_compose, \
         patch("ipfs_client.upload_json", new_callable=AsyncMock) as mock_ipfs, \
         patch("server.linera_publish_event", new_callable=AsyncMock) as mock_linera:
        
        mock_detect.return_value = {"detected": True}
        mock_verify.return_value = {"verified": True}
        mock_score.return_value = {"confidence": 0.95}
        mock_compose.return_value = summary
        mock_ipfs.return_value = "QmTestCID"
        mock_linera.return_value = {"tx_hash": "0xabc123", "chain_id": "chain_1"}
        
        # Import and run verification
        from server import run_ai_verification
        
        # Mock database
        mock_db = MagicMock()
        mock_db.events.update_one = AsyncMock()
        
        with patch("server.db", mock_db), \
             patch("server.manager.broadcast", new_callable=AsyncMock), \
             patch.dict("os.environ", {"ENV": "production"}):
            
            await run_ai_verification(event_id, event)
            
            # Verify IPFS was called
            mock_ipfs.assert_called_once()
            
            # Verify Linera was called with correct params
            mock_linera.assert_called_once()
            call_args = mock_linera.call_args[1]
            assert call_args["event_id"] == event_id
            assert call_args["confidence"] == 0.95
            assert call_args["cid"] == "QmTestCID"
            
            # Verify database update
            assert mock_db.events.update_one.call_count == 1


@pytest.mark.asyncio
async def test_verification_flow_development():
    """Test verification flow in development mode (mocked)"""
    event_id = "test_event_dev"
    event = {
        "id": event_id,
        "event_title": "Dev Test Event"
    }
    
    summary = {
        "event_id": event_id,
        "confidence": 0.9,
        "proof_links": ["source1"]
    }
    
    with patch("ai_agents.event_detector.EventDetectorAgent.detect", new_callable=AsyncMock) as mock_detect, \
         patch("ai_agents.source_verifier.SourceVerifierAgent.verify", new_callable=AsyncMock), \
         patch("ai_agents.confidence_scorer.ConfidenceScorerAgent.score", new_callable=AsyncMock), \
         patch("ai_agents.summary_composer.SummaryComposerAgent.compose", new_callable=AsyncMock) as mock_compose, \
         patch("oracle.linera_oracle.LineraOracleMock.publish_event", new_callable=AsyncMock) as mock_oracle:
        
        mock_detect.return_value = {}
        mock_compose.return_value = summary
        
        from server import run_ai_verification
        
        mock_db = MagicMock()
        mock_db.events.update_one = AsyncMock()
        
        with patch("server.db", mock_db), \
             patch("server.manager.broadcast", new_callable=AsyncMock), \
             patch.dict("os.environ", {"ENV": "development"}):
            
            await run_ai_verification(event_id, event)
            
            # Verify mock oracle was called
            mock_oracle.assert_called_once_with(summary)
            
            # Verify database has mock values
            update_call = mock_db.events.update_one.call_args[0][1]["$set"]
            assert "onchain" in update_call
            assert update_call["onchain"]["cid"].startswith("mock_cid_")
