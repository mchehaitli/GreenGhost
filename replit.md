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
- Advanced visual email editor with rich formatting capabilities
- Font family and size controls with real-time preview
- Color palette for text and background colors
- Professional image insertion with URL, upload, and stock image options
- Pre-built email component templates (headers, footers, buttons, cards)
- Template variable system for dynamic content
- HTML/Visual/Preview editing modes

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
- July 17, 2025: Enhanced welcome email button for better email client compatibility - Updated button structure to use solid background-color instead of gradients, added target="_blank" and rel="noopener noreferrer" attributes, improved MSO conditional button code, and enhanced styling with mso-padding-alt for Microsoft Outlook compatibility
- July 17, 2025: Fixed email template links to prevent 404 errors - Updated welcome email dashboard URL from non-existent app.greenghost.io/dashboard to working greenghost.io domain, both verification and welcome emails now link to correct live website
- July 17, 2025: Added tab separation for system vs campaign templates - Created dedicated "System Templates" and "Campaign Templates" tabs for better organization, system templates (Welcome/Verification) now shown separately from user-created campaign templates, improved navigation and template management workflow
- July 17, 2025: Fixed system template update functionality and eliminated duplicates - Resolved form validation blocking system template updates by creating bypass logic for required fields, removed duplicate database entries for Welcome and Verification emails to prevent showing multiple copies, system templates now update successfully via HTML editor interface  
- July 17, 2025: Enhanced campaign manager with persistent settings and from email selection - Added automatic saving/restoring of campaign settings when switching between templates, implemented from email selector in campaign manager, fixed email sending authentication issues for prospect emails, ensured all prospect email lists and recipient selections persist across template switches
- July 17, 2025: Restored original email template management system from 2+ months ago - Replaced broken AdvancedEmailEditor with clean HTML textarea implementation, restored simple and reliable email template editing with preview functionality, fixed text visibility issues in visual editor
- July 17, 2025: Recreated original EmailTemplateTab component from Waitlist.tsx - Extracted the exact original email management interface as a separate component, restored simple list view with cards for templates, edit/delete buttons, and straightforward dialog for editing HTML content
- July 17, 2025: Completely redesigned email templates with modern theme - Updated typography to Inter font family, added gradient backgrounds and buttons, improved color consistency with "Green Ghost" branding, enhanced verification code display with monospace font, upgraded to modern rounded corners and elevated shadows
- July 17, 2025: Enhanced Gmail SMTP for professional email branding - Configured sender addresses to show "GreenGhost Verification Team <verify@greenghost.io>" instead of personal Gmail addresses, added professional headers and reply-to addresses
- July 17, 2025: Fixed critical branding issue: corrected company name from "Green" to "Green Ghost" throughout all templates  
- July 17, 2025: Removed all greenghosttech.com email references - Updated system to use @greenghost.io addresses in footer, email templates, and service URLs
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