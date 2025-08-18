# SNPD

SNPD started as a sneaker checkout bot — but it’s always been about more than automation.  
It’s the backbone of a **next-generation sneakerhead community**: combining the speed of automated checkout with the culture of cook groups, hyperlocal feeds, and tokenized participation.

---

## 🚀 Vision

- **For Sneakerheads, By Sneakerheads**: A platform where members connect, share, and strategize around drops.  
- **Cook Group DNA**: Built on the culture of alerts, monitors, and shared knowledge.  
- **Beyond Bots**: It’s not just about copping pairs — it’s about **community, collaboration, and reputation**.  
- **Token Incentives**: Earn tokens by contributing (intel, results, testing), spend them on access, perks, or influence.  
- **Social DNA**: Feeds feel familiar (inspired by Instagram + Yik Yak) but built for sneaker culture and hyperlocal engagement.  

---

## 🛠️ What SNPD Does

- **Checkout Automation**: Core tooling to secure hyped sneakers at release.  
- **Community Feeds**: Location-aware posts and updates around drops.  
- **Token Mechanics**: Contribution → rewards → access + status.  
- **Hyperlocal Features**: Surface and reward participation at the city/street level.  
- **Adapters**: Modular integrations for retailers and raffle systems.  

---

## ⚙️ Tech Overview

- **Languages**: Python (automation, services), TypeScript/JavaScript (front-end/dashboard).  
- **Frameworks**:  
  - FastAPI (services & APIs)  
  - Playwright (automation & simulation)  
  - React/Next.js (planned social layer)  
- **Infra**:  
  - Dockerized services  
  - GitHub Actions for CI/CD  
  - Token logic (smart contract stubs in repo)  

---

## 🧠 Architecture Details

### Core Sneaker Access Functionality

- **Automation Engine:**  
  - **Task Queue:** Use a robust task queue like RabbitMQ or Redis to manage purchase requests. Each request will be a job in the queue.  
  - **Worker Pool:** A pool of worker processes (or servers) will consume jobs from the queue. Each worker will be responsible for running a Playwright script to automate the purchase process. This architecture allows for horizontal scaling to handle a large number of requests simultaneously.  
  - **Playwright Scripts:** Develop modular and retailer-specific Playwright scripts. Each script will handle the entire purchase flow for a specific website, from adding to cart to checking out.  
- **Data Management:**  
  - **User Data:** Securely store user's personal and payment data in an encrypted format in a database.  
  - **Session Management:** Use a distributed session management system like Redis to maintain user sessions across multiple servers.  

### Community & Monitoring Layer

- **Real-time Alerts:**  
  - **Monitoring Service:** A dedicated service will continuously monitor sneaker websites for restocks. This can be done by periodically scraping the websites or by using APIs if available.  
  - **WebSocket Server:** When a restock is detected, the monitoring service will publish an event to a WebSocket server (e.g., using Socket.IO).  
  - **Client-side Connection:** The frontend application will maintain a persistent WebSocket connection to the server to receive real-time alerts.  
- **Geohashing:**  
  - **Database:** Use a database with spatial indexing capabilities like PostgreSQL with PostGIS.  
  - **Geocoding API:** Use a geocoding API like the Google Maps Geocoding API or a self-hosted solution like Nominatim to convert addresses to latitude and longitude.  
  - **Spatial Queries:** Use the database's spatial query capabilities to find nearby sneaker activity and events.  
- **Tokenized "Karma" System:**  
  - **Karma Ledger:** A simple database table will act as a ledger, tracking all karma transactions.  
  - **Karma Rules Engine:** A module will define the rules for earning and spending karma. For example, reporting a restock might earn a user 10 karma points, while entering a raffle might cost 5 karma points.  

---

## 📊 Data Structures, APIs, and Schema

```json
{
  "User": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "password_hash": "string",
    "karma_balance": "integer",
    "shipping_address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "country": "string"
    },
    "payment_info": "encrypted_string"
  },
  "Sneaker": {
    "id": "uuid",
    "name": "string",
    "brand": "string",
    "style_code": "string",
    "release_date": "datetime",
    "retail_price": "decimal"
  },
  "Restock": {
    "id": "uuid",
    "sneaker_id": "uuid",
    "store_id": "uuid",
    "size": "string",
    "price": "decimal",
    "timestamp": "datetime"
  },
  "Store": {
    "id": "uuid",
    "name": "string",
    "website_url": "string"
  },
  "Trade": {
    "id": "uuid",
    "proposer_id": "uuid",
    "accepter_id": "uuid",
    "proposed_sneaker_id": "uuid",
    "desired_sneaker_id": "uuid",
    "status": "string" // e.g., 'pending', 'accepted', 'rejected'
  }
}
```

- `POST /api/users/register`: Create a new user account.  
- `POST /api/users/login`: Authenticate a user and return a JWT.  
- `GET /api/sneakers`: Get a list of all sneakers.  
- `GET /api/sneakers/:id`: Get information about a specific sneaker.  
- `GET /api/restocks`: Get a list of recent restocks.  
- `POST /api/purchase-requests`: Create a new purchase request.  
- `GET /api/community/feed`: Get the real-time community feed.  
- `POST /api/community/trades`: Create a new trade request.  
- `PUT /api/community/trades/:id`: Accept or reject a trade request.  

---

## 📋 Requirements

- Python 3.11+  
- Node.js 20+ (for front-end/dashboard)  
- Docker (recommended)  
- Git  

---

## 🔧 Setup

```bash
# Clone the repo
git clone https://github.com/myspacecornelius/SNPD.git
cd SNPD

# Python setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Optional front-end
npm install

Run the API service:

uvicorn services.api.main:app --reload


⸻

💻 Usage

Checkout flow with an adapter:

python tools/run_checkout.py --site nike --sku 12345

Simulation (browser-based):

python tools/simulate_checkout.py --site adidas --dry-run

Tests:

pytest tests/

Dockerized run:

docker compose up --build


⸻

🧩 Roadmap
	•	Social layer: posts, replies, likes, location-aware feeds.
	•	Token economy: reward contributors, unlock perks, govern features.
	•	Expanded adapters: cover more retailers + raffles.
	•	Hyperlocal cook group experiences.
	•	Seamless blend of automation + community.

⸻

🌐 Community

SNPD evolves the cook group model into something bigger:
a sneakerhead-native network where automation, culture, and community intersect.

---