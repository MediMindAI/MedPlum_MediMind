# Medplum Local Development Setup Guide

## Prerequisites

1. **Docker Desktop** - Must be running before starting services
2. **Node.js** - v22.18.0+ or v24.2.0+ (currently using v22.12.0)
3. **npm** - v10.9.4+ (currently using v11.6.2)

## Project Structure

```
medplum_medimind/
├── packages/
│   ├── server/          # Backend API server
│   ├── app/             # Frontend web application
│   ├── core/            # Core libraries
│   └── ...              # Other packages
├── docker-compose.yml                    # Basic Docker services (PostgreSQL, Redis)
├── docker-compose.full-stack.yml        # Full stack including server
└── localrun.md                          # This file
```

## Quick Start (Recommended Method)

### 1. Install Dependencies (First Time Only)
```bash
cd /Users/toko/Desktop/medplum_medimind
npm install
```
**Time:** ~1-2 minutes
**What it does:** Downloads all required packages (~3,200 packages)

### 2. Build the Project (First Time Only)
```bash
npm run build:fast
```
**Time:** ~1-2 minutes
**What it does:** Compiles TypeScript to JavaScript, builds app and server packages

### 3. Start Docker Services
```bash
# Make sure Docker Desktop is running first!
docker compose -f docker-compose.full-stack.yml up -d medplum-server
```
**What this starts:**
- PostgreSQL (port 5432) - Database
- Redis (port 6379) - Cache/Queue
- Medplum Server (port 8103) - API Backend (pre-built Docker image)

**Wait time:** 30-60 seconds for server to initialize

### 4. Verify Server is Running
```bash
curl http://localhost:8103/healthcheck
```
**Expected output:**
```json
{"ok":true,"version":"5.0.2-cfd13f2","postgres":true,"redis":true}
```

### 5. Start Web App
```bash
cd packages/app
npm run dev
```
**Keep this terminal open!**
**Port:** 3000
**URL:** http://localhost:3000

### 6. Access the Application
- **URL:** http://localhost:3000
- **Email:** admin@example.com
- **Password:**  medplum_admin

## Stopping Everything

### Stop Web App
- Press `Ctrl+C` in the terminal running the app

### Stop Docker Services
```bash
cd /Users/toko/Desktop/medplum_medimind
docker compose -f docker-compose.full-stack.yml down
```

### Check What's Running
```bash
# Check Docker containers
docker ps

# Check ports
lsof -i :3000    # Web app
lsof -i :8103    # Server
lsof -i :5432    # PostgreSQL
lsof -i :6379    # Redis
```

## Restarting (After First Setup)

You only need to repeat steps 3-5:
1. Ensure Docker Desktop is running
2. Start Docker services: `docker compose -f docker-compose.full-stack.yml up -d medplum-server`
3. Start web app: `cd packages/app && npm run dev`
4. Open browser to http://localhost:3000

## Alternative Method: Running Server from Source

⚠️ **WARNING:** This method has issues with the server hanging during initialization.

If you need to run the server from source (not recommended):

```bash
cd packages/server
npm run dev
```

**Known Issues:**
- Server process starts but hangs without output
- Doesn't listen on port 8103
- tsx watch mode doesn't initialize properly
- Database migrations don't complete

**Why it fails:**
- The tsx watch mode with OpenTelemetry instrumentation appears to hang
- Issue may be related to Node.js version compatibility or initialization hooks
- Docker image works because it's pre-built and tested

## Troubleshooting

### Server Won't Start (Docker Method)
```bash
# Check Docker logs
docker logs medplum_medimind-medplum-server-1

# Restart services
docker compose -f docker-compose.full-stack.yml restart medplum-server
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8103

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

### Database Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Access database directly
docker exec -it medplum_medimind-postgres-1 psql -U medplum

# Inside psql:
\dt        # List tables
\q         # Quit
```

### Web App Won't Build
```bash
# Clean and rebuild
cd packages/app
rm -rf dist node_modules/.vite
npm run build
npm run dev
```

### Complete Reset
```bash
# Stop everything
docker compose -f docker-compose.full-stack.yml down -v

# Remove node modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build:fast

# Restart
docker compose -f docker-compose.full-stack.yml up -d medplum-server
cd packages/app && npm run dev
```

## Important Ports

| Service          | Port | URL                              |
|------------------|------|----------------------------------|
| Web App          | 3000 | http://localhost:3000            |
| API Server       | 8103 | http://localhost:8103            |
| Server Health    | 8103 | http://localhost:8103/healthcheck|
| PostgreSQL       | 5432 | localhost:5432                   |
| Redis            | 6379 | localhost:6379                   |

## Default Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@example.com  |
| Password | medplum_admin      |

## Architecture Overview

```
Browser (localhost:3000)
    ↓
Web App (Vite Dev Server)
    ↓ HTTP/REST
API Server (Docker Container - localhost:8103)
    ↓
PostgreSQL (Docker Container - localhost:5432)
Redis (Docker Container - localhost:6379)
```

## Development Workflow

1. **Make changes to app code** in `packages/app/src/`
2. **Vite will auto-reload** - changes appear instantly in browser
3. **Make changes to server code** - requires rebuilding Docker image (not recommended)
4. **Database changes** - handled automatically by server migrations

## Files & Directories

### Important Configuration Files
- `packages/app/package.json` - App dependencies and scripts
- `packages/server/medplum.config.json` - Server configuration
- `docker-compose.full-stack.yml` - Docker services configuration

### Data Directories
- `packages/server/binary/` - File storage (created at runtime)
- Docker volumes - Database persists in Docker volumes

## Common Commands

```bash
# Install dependencies
npm install

# Build everything
npm run build:fast

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run prettier

# Start Docker services only (no server)
docker compose up -d

# Start full stack (with server)
docker compose -f docker-compose.full-stack.yml up -d medplum-server

# View Docker logs
docker compose -f docker-compose.full-stack.yml logs -f medplum-server

# Stop all Docker services
docker compose -f docker-compose.full-stack.yml down

# Remove volumes (complete reset)
docker compose -f docker-compose.full-stack.yml down -v
```

## Notes for AI Agents

### What Worked
1. ✅ Using Docker image for server (`medplum/medplum-server:latest`)
2. ✅ Running web app from source (`npm run dev` in packages/app)
3. ✅ Docker Compose for PostgreSQL and Redis

### What Didn't Work
1. ❌ Running server from source with `npm run dev` in packages/server
   - Process hangs after "tsx watch --import ./src/otel/instrumentation.ts src/index.ts"
   - No output, doesn't listen on port 8103
   - Database migrations don't complete

2. ❌ Running migrations with `npm run migrate`
   - Script is for creating new migrations, not running them
   - Migrations should run automatically when server starts

3. ❌ Background bash execution with proper output capture
   - tsx watch mode buffers output
   - Better to run in foreground terminal or use Docker

### Setup Process That Worked
1. Install dependencies (`npm install`)
2. Build project (`npm run build:fast`)
3. Start Docker services with server (`docker compose -f docker-compose.full-stack.yml up -d medplum-server`)
4. Wait 30-60 seconds for server initialization
5. Verify with healthcheck endpoint
6. Start web app in separate terminal (`cd packages/app && npm run dev`)
7. Access at http://localhost:3000

### Time Estimates
- First time setup: ~5-10 minutes (including Docker downloads)
- Subsequent starts: ~1-2 minutes
- Dependency install: ~1-2 minutes
- Build: ~1-2 minutes
- Docker server startup: ~30-60 seconds
- Web app startup: ~10-20 seconds

## Version Information

- **Medplum Version:** 5.0.2
- **Node.js:** v22.12.0 (works, though v22.18.0+ recommended)
- **npm:** v11.6.2
- **Docker Images:**
  - postgres:16
  - redis:7
  - medplum/medplum-server:latest

## Support & Resources

- **Medplum Docs:** https://www.medplum.com/docs
- **Local Dev Setup:** https://www.medplum.com/docs/contributing/local-dev-setup
- **FHIR R4 Spec:** https://hl7.org/fhir/R4/

## Last Updated

Created: November 11, 2025
Status: Working setup using Docker for server, source for web app
