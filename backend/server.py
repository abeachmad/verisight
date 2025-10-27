from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
import json

# Import AI agents
from ai_agents.event_detector import EventDetectorAgent
from ai_agents.source_verifier import SourceVerifierAgent
from ai_agents.confidence_scorer import ConfidenceScorerAgent
from ai_agents.summary_composer import SummaryComposerAgent
from oracle.linera_oracle import LineraOracleMock

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Verisight API", description="AI-Powered Oracle & Prediction Platform")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'verisight-secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Initialize AI Agents
event_detector = EventDetectorAgent()
source_verifier = SourceVerifierAgent()
confidence_scorer = ConfidenceScorerAgent()
summary_composer = SummaryComposerAgent()

# Initialize Oracle
oracle = LineraOracleMock()

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ============= Models =============

class WalletAuth(BaseModel):
    wallet_address: str
    signature: str
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_title: str
    event_description: str
    category: str  # sports, politics, crypto, etc.
    result: Optional[str] = None
    confidence: float = 0.0
    status: str = "pending"  # pending, verifying, verified, resolved
    proof_links: List[str] = []
    reasoning: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None
    created_by: Optional[str] = None

class EventCreate(BaseModel):
    event_title: str
    event_description: str
    category: str

class Market(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    title: str
    description: str
    options: List[Dict[str, Any]]  # [{"id": "yes", "label": "Yes", "odds": 1.5, "volume": 1000}]
    total_volume: float = 0.0
    status: str = "active"  # active, closed, resolved
    resolution: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class MarketCreate(BaseModel):
    event_id: str
    title: str
    description: str
    options: List[Dict[str, Any]]

class Prediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    market_id: str
    user_address: str
    option_id: str
    amount: float
    odds: float
    potential_payout: float
    status: str = "active"  # active, won, lost
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PredictionCreate(BaseModel):
    market_id: str
    option_id: str
    amount: float

class Strategy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    creator_address: str
    strategy_type: str  # ai-agent, manual
    performance: Dict[str, Any] = {}  # {"total_trades": 10, "win_rate": 0.7, "roi": 0.25}
    followers: int = 0
    is_public: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StrategyCreate(BaseModel):
    name: str
    description: str
    strategy_type: str
    is_public: bool = True

# ============= Auth Functions =============

def create_access_token(wallet_address: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=int(os.environ.get('JWT_EXPIRATION_HOURS', 24)))
    payload = {
        "sub": wallet_address,
        "exp": expiration,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        wallet_address: str = payload.get("sub")
        if wallet_address is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return wallet_address
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# ============= Routes =============

@api_router.get("/")
async def root():
    return {"message": "Verisight API - Truth in Real Time", "version": "1.0.0"}

# Auth Routes
@api_router.post("/auth/challenge")
async def get_challenge(wallet_address: str):
    """Generate a challenge message for wallet signature"""
    timestamp = datetime.now(timezone.utc).isoformat()
    message = f"Sign this message to authenticate with Verisight\n\nWallet: {wallet_address}\nTimestamp: {timestamp}\nNonce: {uuid.uuid4()}"
    return {"message": message, "timestamp": timestamp}

@api_router.post("/auth/verify", response_model=TokenResponse)
async def verify_signature(auth: WalletAuth):
    """Verify wallet signature and issue JWT token (mocked for now)"""
    # In production, verify signature using web3
    # For now, we'll mock the verification
    if not auth.wallet_address or not auth.signature:
        raise HTTPException(status_code=400, detail="Invalid authentication data")
    
    # Create or update user
    await db.users.update_one(
        {"wallet_address": auth.wallet_address},
        {"$set": {
            "wallet_address": auth.wallet_address,
            "last_login": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    access_token = create_access_token(auth.wallet_address)
    return TokenResponse(access_token=access_token)

# Event Routes
@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate, user: str = Depends(get_current_user)):
    event_dict = event.model_dump()
    event_obj = Event(**event_dict, created_by=user)
    
    doc = event_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.events.insert_one(doc)
    
    # Broadcast new event
    await manager.broadcast({"type": "new_event", "data": doc})
    
    return event_obj

@api_router.get("/events", response_model=List[Event])
async def get_events(status: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    if category:
        query['category'] = category
    
    events = await db.events.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if event.get('resolved_at') and isinstance(event['resolved_at'], str):
            event['resolved_at'] = datetime.fromisoformat(event['resolved_at'])
    
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    if event.get('resolved_at') and isinstance(event['resolved_at'], str):
        event['resolved_at'] = datetime.fromisoformat(event['resolved_at'])
    
    return event

@api_router.post("/events/{event_id}/verify")
async def verify_event(event_id: str, background_tasks: BackgroundTasks):
    """Trigger AI verification of an event"""
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update status to verifying
    await db.events.update_one(
        {"id": event_id},
        {"$set": {"status": "verifying"}}
    )
    
    # Trigger AI verification in background
    background_tasks.add_task(run_ai_verification, event_id, event)
    
    return {"message": "Verification started", "event_id": event_id}

# Market Routes
@api_router.post("/markets", response_model=Market)
async def create_market(market: MarketCreate, user: str = Depends(get_current_user)):
    market_dict = market.model_dump()
    market_obj = Market(**market_dict)
    
    doc = market_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.markets.insert_one(doc)
    
    await manager.broadcast({"type": "new_market", "data": doc})
    
    return market_obj

@api_router.get("/markets", response_model=List[Market])
async def get_markets(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    
    markets = await db.markets.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for market in markets:
        if isinstance(market.get('created_at'), str):
            market['created_at'] = datetime.fromisoformat(market['created_at'])
        if market.get('resolved_at') and isinstance(market['resolved_at'], str):
            market['resolved_at'] = datetime.fromisoformat(market['resolved_at'])
    
    return markets

@api_router.get("/markets/{market_id}", response_model=Market)
async def get_market(market_id: str):
    market = await db.markets.find_one({"id": market_id}, {"_id": 0})
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    if isinstance(market.get('created_at'), str):
        market['created_at'] = datetime.fromisoformat(market['created_at'])
    if market.get('resolved_at') and isinstance(market['resolved_at'], str):
        market['resolved_at'] = datetime.fromisoformat(market['resolved_at'])
    
    return market

# Prediction Routes
@api_router.post("/predictions", response_model=Prediction)
async def create_prediction(prediction: PredictionCreate, user: str = Depends(get_current_user)):
    market = await db.markets.find_one({"id": prediction.market_id}, {"_id": 0})
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    if market['status'] != 'active':
        raise HTTPException(status_code=400, detail="Market is not active")
    
    # Find option
    option = next((o for o in market['options'] if o['id'] == prediction.option_id), None)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    
    prediction_dict = prediction.model_dump()
    prediction_obj = Prediction(
        **prediction_dict,
        user_address=user,
        odds=option['odds'],
        potential_payout=prediction.amount * option['odds']
    )
    
    doc = prediction_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.predictions.insert_one(doc)
    
    # Update market volume
    await db.markets.update_one(
        {"id": prediction.market_id},
        {"$inc": {"total_volume": prediction.amount}}
    )
    
    return prediction_obj

@api_router.get("/predictions", response_model=List[Prediction])
async def get_user_predictions(user: str = Depends(get_current_user)):
    predictions = await db.predictions.find({"user_address": user}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for pred in predictions:
        if isinstance(pred.get('created_at'), str):
            pred['created_at'] = datetime.fromisoformat(pred['created_at'])
    
    return predictions

# Strategy Routes
@api_router.post("/strategies", response_model=Strategy)
async def create_strategy(strategy: StrategyCreate, user: str = Depends(get_current_user)):
    strategy_dict = strategy.model_dump()
    strategy_obj = Strategy(**strategy_dict, creator_address=user)
    
    doc = strategy_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.strategies.insert_one(doc)
    
    return strategy_obj

@api_router.get("/strategies", response_model=List[Strategy])
async def get_strategies(is_public: bool = True):
    strategies = await db.strategies.find({"is_public": is_public}, {"_id": 0}).sort("followers", -1).to_list(100)
    
    for strategy in strategies:
        if isinstance(strategy.get('created_at'), str):
            strategy['created_at'] = datetime.fromisoformat(strategy['created_at'])
    
    return strategies

@api_router.get("/strategies/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: str):
    strategy = await db.strategies.find_one({"id": strategy_id}, {"_id": 0})
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    if isinstance(strategy.get('created_at'), str):
        strategy['created_at'] = datetime.fromisoformat(strategy['created_at'])
    
    return strategy

@api_router.post("/strategies/{strategy_id}/follow")
async def follow_strategy(strategy_id: str, user: str = Depends(get_current_user)):
    result = await db.strategies.update_one(
        {"id": strategy_id},
        {"$inc": {"followers": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return {"message": "Strategy followed successfully"}

# Analytics Routes
@api_router.get("/analytics/overview")
async def get_analytics_overview():
    total_events = await db.events.count_documents({})
    total_markets = await db.markets.count_documents({})
    total_predictions = await db.predictions.count_documents({})
    active_markets = await db.markets.count_documents({"status": "active"})
    
    # Get total volume
    markets = await db.markets.find({}, {"total_volume": 1, "_id": 0}).to_list(1000)
    total_volume = sum(m.get('total_volume', 0) for m in markets)
    
    return {
        "total_events": total_events,
        "total_markets": total_markets,
        "total_predictions": total_predictions,
        "active_markets": active_markets,
        "total_volume": total_volume
    }

@api_router.get("/analytics/agent-stats")
async def get_agent_stats():
    """Get AI agent performance statistics"""
    verified_events = await db.events.find({"status": "verified"}, {"_id": 0}).to_list(1000)
    
    total_verifications = len(verified_events)
    avg_confidence = sum(e.get('confidence', 0) for e in verified_events) / max(total_verifications, 1)
    high_confidence = sum(1 for e in verified_events if e.get('confidence', 0) > 0.9)
    
    return {
        "total_verifications": total_verifications,
        "average_confidence": round(avg_confidence, 2),
        "high_confidence_count": high_confidence,
        "accuracy_rate": 0.94  # Mocked for now
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task for AI verification
async def run_ai_verification(event_id: str, event: dict):
    """Run AI agents to verify an event"""
    try:
        # Step 1: Detect event details
        detection_result = await event_detector.detect(event)
        
        # Step 2: Verify sources
        verification_result = await source_verifier.verify(event, detection_result)
        
        # Step 3: Calculate confidence
        confidence_result = await confidence_scorer.score(verification_result)
        
        # Step 4: Compose summary
        summary = await summary_composer.compose(confidence_result)
        
        # Step 5: Publish to oracle
        await oracle.publish_event(summary)
        
        # Update event in database
        await db.events.update_one(
            {"id": event_id},
            {"$set": {
                "status": "verified",
                "result": summary.get('result'),
                "confidence": summary.get('confidence'),
                "proof_links": summary.get('proof_links', []),
                "reasoning": summary.get('reasoning'),
                "resolved_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Broadcast update
        await manager.broadcast({
            "type": "event_verified",
            "data": {"event_id": event_id, "summary": summary}
        })
        
    except Exception as e:
        logging.error(f"Error verifying event {event_id}: {str(e)}")
        await db.events.update_one(
            {"id": event_id},
            {"$set": {"status": "error"}}
        )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()