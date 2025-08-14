#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}SneakerSniper Bot Engine - Setup Script${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Copy requirements to services
echo -e "${YELLOW}Setting up services...${NC}"
for service in api monitor checkout proxy; do
    if [ -d "services/$service" ]; then
        cp requirements.txt services/$service/
        touch services/$service/__init__.py
    fi
done

if [ -d "worker" ]; then
    cp requirements.txt worker/
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env created (please update with your values)${NC}"
fi

# Create Docker network
echo -e "${YELLOW}Creating Docker network...${NC}"
docker network create sneakersniper-net 2>/dev/null || true

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}Run 'make dev' to start the services${NC}"
