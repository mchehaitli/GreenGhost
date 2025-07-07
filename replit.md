# GreenGhost - Automated Lawn Care Platform

## Overview

GreenGhost is a full-stack web application for an automated lawn care service company. The platform features a modern React frontend with TypeScript, a Node.js Express backend, and PostgreSQL database integration. The application includes user authentication, a waitlist system with email verification, admin management tools, and comprehensive service presentation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component system
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions with Passport.js (Local Strategy)
- **Email Service**: Nodemailer with Gmail integration
- **Security**: CORS enabled, bcrypt for password hashing, session management

### Database Schema
- **Users**: Admin user management with role-based access
- **Waitlist**: Email collection with verification system
- **Verification Tokens**: Time-limited email verification codes
- **Email Templates**: Customizable email template system
- **Email Segments**: User segmentation for targeted campaigns

## Key Components

### Authentication System
- Session-based authentication using Express sessions
- Password hashing with scrypt algorithm
- Protected routes with middleware authentication
- Admin-only access controls for management features

### Waitlist Management
- Two-step email verification process (email → verification code → confirmation)
- Automatic cleanup of expired verification tokens
- Admin dashboard for managing waitlist entries
- Analytics and reporting features

### Email System
- Template-based email system with HTML/text versions
- Verification email with 90-second expiration
- Welcome email upon successful verification
- Bulk email capabilities for marketing campaigns
- Template customization with visual editor

### Service Presentation
- Responsive landing page with hero section
- Service catalog with detailed descriptions
- Pricing calculator with customizable options
- Quote request system
- Blog functionality for content marketing

## Data Flow

1. **User Registration Flow**:
   - User submits email and ZIP code
   - System generates verification token
   - Email sent with verification code
   - User enters code to complete registration
   - Welcome email sent upon successful verification

2. **Authentication Flow**:
   - Login form submission
   - Credential validation against database
   - Session creation and cookie management
   - Protected route access control

3. **Admin Management Flow**:
   - Admin login through protected route
   - Access to waitlist management dashboard
   - Email template editing and customization
   - Analytics and reporting tools

## External Dependencies

### Email Service
- **Provider**: Gmail SMTP
- **Configuration**: Environment variables for credentials
- **Features**: HTML templates, verification codes, bulk sending

### Database
- **Provider**: Neon (PostgreSQL)
- **ORM**: Drizzle with TypeScript support
- **Migrations**: Automated schema management

### Frontend Libraries
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React icon library
- **Charts**: Recharts for analytics visualization
- **Utilities**: Class variance authority, clsx for styling

## Deployment Strategy

### Build Process
- Frontend: Vite build with asset optimization
- Backend: esbuild bundling for Node.js deployment
- Database: Drizzle migrations for schema management

### Environment Configuration
- Production-ready with environment variable management
- CORS configuration for cross-origin requests
- Session security with proxy trust settings

### Static Assets
- Public directory for static files
- Screenshot generation for documentation
- Theme customization support

## Changelog

Recent Changes:
- July 07, 2025: Refined logo spacing - Added subtle spacing between "Green" and "Ghost" words in header and footer for better visual balance
- July 06, 2025: Rebranded company from "GreenGhost Tech" to "GreenGhost" (removed space) across all pages, emails, and documentation
- July 06, 2025: Fixed authentication persistence and waitlist data loading - Reduced session duration, enhanced logout, and corrected admin portal queries
- July 06, 2025: Fixed login redirect timing issue - Updated authentication flow to properly wait for auth state before redirecting
- July 06, 2025: Fixed critical production authentication issue - Updated login/logout functions to use correct backend URL for greenghost.io
- July 06, 2025: Added comprehensive debugging logging for authentication flow
- July 06, 2025: Resolved cross-origin authentication between Netlify frontend and Render backend for production site
- July 05, 2025: Connected custom domain greenghost.io to Netlify with SSL certificate
- July 05, 2025: Fixed authentication issues between Netlify frontend and Render backend
- July 05, 2025: Updated admin portal queries to handle cross-origin authentication properly
- July 05, 2025: Added production backend URL fallback for live site (greenghost.io)
- July 05, 2025: Successfully deployed complete application - Backend live on Render, Frontend deployed on Netlify
- July 05, 2025: Fixed Netlify build issues by adding missing dependencies (canvas-confetti, xlsx)
- July 04, 2025: Enhanced pricing management with decimal support and comprehensive feature editing
- July 04, 2025: Updated footer social media links with correct greenghost.io URLs
- July 04, 2025: Replaced Twitter icon with X logo using react-icons
- July 04, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.