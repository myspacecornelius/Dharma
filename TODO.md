# Dharma Frontend MVP Implementation TODO

## PR 1: Frontend Scaffold ⏳

### Setup & Dependencies
- [ ] Navigate to frontend directory
- [ ] Install additional dependencies (@tanstack/react-query, geohash, lucide-react)
- [ ] Set up shadcn/ui
- [ ] Create .env.local file

### Core Files Creation
- [ ] Create app/lib/api.ts - API client with adapter functions
- [ ] Create app/providers.tsx - React Query provider
- [ ] Create app/components/post-composer.tsx - Post creation component
- [ ] Create app/components/feed-list.tsx - Feed display component
- [ ] Update app/page.tsx - Main page with geolocation
- [ ] Update app/layout.tsx - Add providers
- [ ] Create README.frontend.md - Documentation

### Testing & Verification
- [ ] Verify npm run dev works on port 3000
- [ ] Test geolocation functionality
- [ ] Test post creation
- [ ] Verify styling with Tailwind + shadcn

## PR 2: API Integration Polish 📋
- [ ] Update root README
- [ ] Add CORS notes
- [ ] Implement optimistic updates
- [ ] Add toast notifications
- [ ] Add loading states

## PR 3: Hyperlocal UX v1 📋
- [ ] Add header with cell_id display
- [ ] Add radius selector
- [ ] Implement localStorage persistence
- [ ] Add post validation and character counter

## PR 4: DevEx + Make Targets 📋
- [ ] Update Makefile with new targets
- [ ] Add Codespaces documentation
- [ ] Test full setup flow
