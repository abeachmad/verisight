<!-- BEGIN KETTY:README_HEADER v1 -->
# Verisight
**AI-verified events → Linera microchains → real-time prediction markets**

**Live Demo**: http://localhost:3000 • **GraphQL**: https://rpc.testnet.linera.net/chains/`<chain-id>`/applications/`<app-id>`

**Linera Testnet**
- OracleFeed `APP_ID=${ORACLEFEED_APP_ID}`
- Market `APP_ID=${MARKET_APP_ID}`

**Linera SDK/Protocol used**
- Contract/Service WASM + GraphQL Service
- Views (Register/Map/Queue)
- ABI (Operations/Queries)
- Anti-manipulasi (velocity cap/cooldown)

Lihat `docs/ONCHAIN.md` untuk ABI & contoh query.
<!-- END KETTY:README_HEADER v1 -->

---

> AI-powered oracle and prediction platform that validates real-world events, feeds verified results into prediction markets, and provides transparent dashboards for data tracking.

## 🔹 Overview

Verisight is a decentralized application (DApp) built on the Linera Layer-1 network that integrates AI reasoning, market intelligence, and blockchain oracle functions. The platform enables users to:

- Trade on AI-verified real-world events
- Follow AI trading strategies and top traders
- Participate in platform governance
- Track event verification and market analytics in real-time

## 🏗️ Architecture

### System Components

1. **AI Agent Layer** (Backend Python)
   - `event_detector.py` - Identifies trending or relevant real-world events
   - `source_verifier.py` - Cross-checks data across reputable sources
   - `confidence_scorer.py` - Computes confidence levels based on data consensus
   - `summary_composer.py` - Generates final JSON output for blockchain posting

2. **Backend API** (FastAPI + MongoDB)
   - RESTful endpoints for events, markets, predictions, and strategies
   - WebSocket support for real-time updates
   - JWT-based authentication with wallet signatures
   - Background task processing for AI verification

3. **Oracle Layer** (Mocked - Ready for Linera Integration)
   - Accepts verified event payloads from backend
   - Validates confidence threshold and schema integrity
   - Ready for real blockchain integration

4. **Frontend** (React + TailwindCSS + shadcn/ui)
   - Landing page with animated hero section
   - Markets exploration and trading interface
   - Copy trading dashboard
   - Analytics dashboard with live charts
   - Governance voting interface

## 🚀 Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: OpenAI GPT-4o
- **Authentication**: JWT with Web3 wallet signatures
- **Real-time**: WebSockets

### Frontend
- **Framework**: React 19
- **Styling**: TailwindCSS + Custom CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Web3**: WalletConnect + wagmi + viem
- **State Management**: React Context
- **Routing**: React Router v7

### Blockchain (Mocked)
- **Target Network**: Linera L1
- **Oracle**: Mocked implementation ready for real integration

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py                 # Main FastAPI application
│   ├── .env                      # Environment variables
│   ├── requirements.txt          # Python dependencies
│   ├── ai_agents/               # AI agent modules
│   │   ├── event_detector.py
│   │   ├── source_verifier.py
│   │   ├── confidence_scorer.py
│   │   └── summary_composer.py
│   └── oracle/                  # Oracle layer
│       └── linera_oracle.py     # Mocked oracle (ready for integration)
│
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main app component
│   │   ├── index.css            # Global styles
│   │   ├── pages/               # Page components
│   │   │   ├── Landing.js
│   │   │   ├── Markets.js
│   │   │   ├── MarketDetail.js
│   │   │   ├── CreateMarket.js
│   │   │   ├── CopyTrading.js
│   │   │   ├── Dashboard.js
│   │   │   └── Governance.js
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ui/              # shadcn components
│   │   └── context/
│   │       └── WalletContext.js # Wallet connection context
│   ├── package.json
│   └── .env
│
└── README.md                    # This file
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB
- OpenAI API key (optional - uses mock mode if not provided)

### Backend Setup

1. Navigate to backend directory:
```bash
cd /app/backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="verisight_db"
CORS_ORIGINS="*"
OPENAI_API_KEY="your-openai-api-key-here"  # Optional
JWT_SECRET="your-jwt-secret"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_HOURS=24
```

4. Start the backend:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd /app/frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables in `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_WALLETCONNECT_PROJECT_ID=your-project-id  # Optional
```

4. Start the frontend:
```bash
yarn start
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/challenge` - Get signature challenge
- `POST /api/auth/verify` - Verify signature and get JWT token

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create new event (authenticated)
- `POST /api/events/{id}/verify` - Trigger AI verification

### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/{id}` - Get market details
- `POST /api/markets` - Create new market (authenticated)

### Predictions
- `GET /api/predictions` - Get user predictions (authenticated)
- `POST /api/predictions` - Place new prediction (authenticated)

### Copy Trading
- `GET /api/strategies` - List trading strategies
- `GET /api/strategies/{id}` - Get strategy details
- `POST /api/strategies` - Create new strategy (authenticated)
- `POST /api/strategies/{id}/follow` - Follow a strategy (authenticated)

### Analytics
- `GET /api/analytics/overview` - Platform overview statistics
- `GET /api/analytics/agent-stats` - AI agent performance stats

### WebSocket
- `WS /ws` - Real-time updates for events and markets

## 🧠 AI Agent System

### Event Verification Pipeline

1. **Event Detection**
   - Identifies trending events from various sources
   - Extracts key details and context

2. **Source Verification**
   - Cross-checks information across multiple reputable sources
   - Identifies consensus and conflicts

3. **Confidence Scoring**
   - Calculates confidence score (0.0 to 1.0)
   - Requires ≥2 sources for high confidence (>0.9)

4. **Summary Composition**
   - Generates structured JSON output
   - Includes reasoning and proof links
   - Marks for manual review if confidence < 0.6

### AI Integration

The system supports **two modes**:

1. **OpenAI GPT-4o Mode** (when API key provided)
   - Uses GPT-4o for intelligent event analysis
   - Provides detailed reasoning and context

2. **Mock Mode** (default - no API key required)
   - Uses deterministic algorithms
   - Generates realistic mock data for testing

## 🔗 Blockchain Oracle Integration

### Current Status: Mocked

The oracle layer is fully structured and ready for Linera integration:

```python
# oracle/linera_oracle.py
class LineraOracleMock:
    async def publish_event(self, event_payload):
        # Validates payload structure
        # Mock blockchain transaction
        # Ready for real Linera SDK integration
```

### Integration Steps

1. Install Linera SDK: `cargo install linera`
2. Configure wallet and network
3. Deploy oracle smart contract
4. Update oracle connection parameters
5. Replace mock methods with Linera SDK calls

## 🎨 Design System

### Colors
- **Primary**: `#0A0F1F` (Dark Blue)
- **Accent**: `#00FFFF` (Cyan)
- **Neutral**: `#A9B4C2` (Light Gray)
- **Surface**: `#141b2d` (Dark Surface)

### Typography
- **Display**: Orbitron (headings)
- **Body**: Inter (text)

### Features
- Glassmorphism effects with backdrop blur
- Smooth transitions and hover animations
- Responsive design (mobile-first)
- Dark theme optimized for readability

## 🔐 Security

### Authentication
- **Web3 Wallet Connection**: MetaMask, WalletConnect
- **Signature-based Authentication**: No passwords required
- **JWT Tokens**: Stateless session management

### Data Validation
- Input validation on all endpoints
- MongoDB injection prevention
- CORS protection
- Rate limiting (recommended for production)

## 📊 Key Features

### 1. Prediction Markets
- Trade on AI-verified events
- Real-time odds updates
- Transparent resolution

### 2. AI Verification
- Multi-agent verification system
- 94% accuracy rate (mock data)
- Transparent reasoning and proof links

### 3. Copy Trading
- Follow top traders and AI strategies
- Performance metrics (win rate, ROI)
- Automated trade replication

### 4. Analytics Dashboard
- Real-time event tracking
- AI agent performance metrics
- Trading volume charts
- System logs

### 5. Governance
- Vote on platform proposals
- Quorum-based decision making
- Transparent voting results

## 🧪 Testing

### Backend Testing
```bash
pytest backend/tests/
```

### Frontend Testing
```bash
cd frontend && yarn test
```

### API Testing
```bash
# Get API root
curl http://localhost:8001/api/

# List events
curl http://localhost:8001/api/events

# List markets
curl http://localhost:8001/api/markets
```

## 🚢 Deployment

### Deploy to Linera Testnet

1. **Publish contracts to testnet:**
```bash
bash scripts/testnet_publish.sh
```
This will:
- Build WASM contracts
- Initialize Linera wallet (if needed)
- Deploy OracleFeed and Market contracts
- Update `.env` files with APP_IDs

2. **Seed sample markets:**
```bash
bash scripts/testnet_seed.sh
```
Creates 3 sample markets on testnet.

3. **Verify deployment:**
```bash
# Get your chain ID
linera wallet show

# Query markets via GraphQL
curl -X POST https://rpc.testnet.linera.net/chains/<chain-id>/applications/<market-app-id> \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ markets(offset: 0, limit: 10) }"}'
```

### Production Checklist
- [ ] Set secure JWT_SECRET
- [ ] Configure production MongoDB
- [ ] Add OpenAI API key
- [ ] Set up Linera wallet and network
- [ ] Deploy oracle smart contract
- [ ] Configure rate limiting
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=                    # MongoDB connection string
DB_NAME=                      # Database name
CORS_ORIGINS=                 # Allowed origins
OPENAI_API_KEY=               # OpenAI API key (optional)
JWT_SECRET=                   # JWT signing secret
JWT_ALGORITHM=HS256           # JWT algorithm
JWT_EXPIRATION_HOURS=24       # Token expiration
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=                    # Backend API URL
REACT_APP_WALLETCONNECT_PROJECT_ID=       # WalletConnect project ID (optional)
```

## 🤝 Contributing

This is an MVP demonstration project. For production deployment:

1. Replace mocked AI agents with real OpenAI integration
2. Implement real Linera blockchain integration
3. Add comprehensive test coverage
4. Set up CI/CD pipeline
5. Add monitoring and logging
6. Implement proper error handling and retry logic

## 📄 License

MIT License - Feel free to use this project as a starting point for your own DApp.

## 🔮 Future Enhancements

- [ ] Real Linera blockchain integration
- [ ] Mobile app (React Native)
- [ ] Advanced trading strategies
- [ ] Social features (comments, discussions)
- [ ] NFT rewards for top traders
- [ ] Multi-chain support
- [ ] Advanced analytics and ML predictions
- [ ] Integration with more data sources

## 📦 Releases & Versioning

### Tagging a Wave

To create a new release wave:

```bash
# Create and push a wave tag
git tag wave-01
git push origin wave-01
```

This automatically triggers a GitHub Release with:
- Changelog for the wave
- Linera testnet deployment info (APP_IDs)
- Links to documentation
- Optional WASM artifacts

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ on Linera L1**

Verisight - Truth in Real Time
