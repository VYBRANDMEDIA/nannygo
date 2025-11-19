# NannyGo TODO

## Database & Schema
- [x] Update database schema with profiles, nanny_profiles, bookings, reviews tables
- [x] Add role field to users table (parent/nanny)
- [x] Push database migrations

## Branding & Design
- [x] Configure turquoise and pink color scheme in Tailwind
- [x] Add NannyGo logo to project
- [x] Update app title and branding constants

## Authentication & Onboarding
- [x] Create onboarding flow for new users to select role (parent/nanny)
- [x] Build nanny profile creation form (bio, hourly_rate, years_experience, max_children, tags)
- [x] Add profile completion check and redirect logic

## Parent Features
- [x] Build nanny discovery page with search/filter by city
- [x] Create nanny detail page with profile information
- [x] Implement booking request form (date, time, address, notes)
- [ ] Build "My Bookings" page for parents to view booking status

## Nanny Features
- [x] Create nanny profile management page
- [x] Add availability toggle (is_available)
- [x] Build bookings dashboard for nannies
- [x] Implement accept/decline booking functionality
- [x] Add booking status management

## General Features
- [x] Create landing page with "Ik ben ouder" / "Ik ben nanny" CTAs
- [x] Build protected app layout with role-based navigation
- [ ] Add booking status updates and notifications
- [ ] Implement proper loading and error states

## Testing & Polish
- [ ] Test complete parent booking flow
- [ ] Test complete nanny booking management flow
- [ ] Verify role-based access control
- [ ] Test on mobile devices
- [ ] Final polish and bug fixes

## Payment Integration
- [x] Add Stripe feature to project
- [x] Configure Stripe API keys
- [x] Add payment status to bookings schema
- [x] Create Stripe subscription product for nannies (€9.95/month)
- [x] Implement 2-month free trial for nannies
- [x] Add subscription checkout flow
- [x] Handle subscription webhooks
- [x] Add subscription status to nanny profiles
- [x] Restrict nanny features based on active subscription

## Admin Dashboard
- [x] Add admin role to users
- [x] Create admin dashboard layout
- [x] Build user management (view all users)
- [x] Build parent management page
- [x] Build nanny management page
- [x] Add ability to activate/deactivate users
- [x] Add admin-only routes and protection

## Profile Media Features
- [ ] Add photo gallery support (max 5 photos per profile)
- [ ] Add profile photo (avatar) upload
- [ ] Add additional photos upload (max 4 extra)
- [ ] Add YouTube video link field for intro video
- [ ] Implement YouTube video embed on profile pages
- [ ] Add photo management UI (upload, delete, reorder)

## Review System
- [ ] Update reviews schema to support both parent and nanny reviews
- [ ] Add average rating calculation to profiles
- [ ] Build review submission form
- [ ] Create dedicated review page/module
- [ ] Display reviews on profile pages
- [ ] Add review count and average score to profiles
- [ ] Only allow reviews after completed bookings

## Design Fixes
- [x] Remove all gradients from landing page
- [x] Use solid turquoise and pink colors only
- [x] Simplify landing page copy (less text)
- [x] Improve landing page layout (more spacing)

## Map View Feature
- [ ] Integrate Google Maps in parent dashboard
- [ ] Add nanny markers on map based on location
- [ ] Create swipeable cards at bottom of map
- [ ] Add smooth animations for card open/close
- [ ] Implement toggle between list and map view
- [ ] Add marker click to show nanny card
- [ ] Animate markers when hovering

## Map View Feature
- [x] Integrate Google Maps in parent dashboard
- [x] Add nanny markers on map based on location
- [x] Create swipeable cards at bottom of map
- [x] Add smooth animations for card open/close
- [x] Implement toggle between list and map view
- [x] Add marker click to show nanny card
- [x] Style with NannyGo branding (turquoise/pink)

## Supabase Integration
- [x] Create SQL schema for Supabase
- [x] Setup Supabase Auth with email/password
- [x] Replace Manus OAuth with Supabase login
- [x] Add registration form with email/password
- [x] Add login form with email/password
- [x] Update auth context to use Supabase
- [ ] Test full authentication flow (requires SQL setup)

## Cloudflare R2 Storage
- [x] Configure R2 client with credentials
- [x] Create image upload utility
- [ ] Add image upload to profile edit pages
- [ ] Handle profile photo upload
- [ ] Handle gallery photos upload (max 5)
- [ ] Add image preview before upload

## Bug Fixes
- [x] Fix infinite loop in Home.tsx (setLocation in render)
- [x] Add password visibility toggle to login form
- [x] Add password visibility toggle to register form

## Native App Feel
- [x] Add smooth page transitions
- [x] Add slide-in animations for cards
- [x] Add fade-in animations for pages
- [x] Remove tap highlights for native feel

## Auth Migration Fix
- [x] Remove all Manus OAuth references
- [x] Update Home.tsx to use Supabase auth buttons
- [x] Remove getLoginUrl references
- [x] Ensure only Supabase login/register work

## UI Redesign
- [x] Redesign Nanny Dashboard with user photo
- [x] Add horizontal stats cards (aanvragen, boekingen, score)
- [x] Redesign profile page with photo upload at top
- [x] Improve profile page layout and spacing
