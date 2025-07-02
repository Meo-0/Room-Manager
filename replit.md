# Room Layout Designer

## Overview

This is a full-stack interior design application that helps users create and visualize room layouts with furniture arrangement. The application provides an interactive canvas where users can design rooms by specifying dimensions, adding doors, placing furniture, and receiving space optimization suggestions.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Canvas Rendering**: HTML5 Canvas API for room visualization
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage (MemStorage class) with interface for future database integration
- **Session Management**: Ready for session-based authentication
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Room Management System
- Room creation and editing with dimensional constraints
- CRUD operations for room layouts
- Validation using Zod schemas
- Memory-based storage with database-ready interface

### Interactive Canvas System
- Real-time furniture placement and manipulation
- Drag-and-drop functionality with collision detection
- Grid system for precise positioning
- Zoom and pan capabilities
- Visual feedback for space conflicts

### Furniture Library
- Pre-defined furniture templates organized by categories
- Customizable furniture properties (dimensions, rotation, color)
- Shape support: rectangle, circle, L-shape, and custom paths
- Template-based furniture creation system

### Door Configuration
- Multiple door types with swing direction simulation
- Wall placement system (north, south, east, west)
- Hinge position and swing angle configuration
- Interference detection with furniture placement

### Space Analysis Engine
- Real-time space efficiency calculations
- Collision detection between furniture pieces
- Door swing interference warnings
- Automated layout suggestions and optimization tips

## Data Flow

1. **User Input**: Room dimensions and preferences entered through form components
2. **State Management**: Local React state manages current room layout, with TanStack Query handling server synchronization
3. **Canvas Rendering**: Real-time visualization updates based on state changes
4. **Validation**: Zod schemas validate all data before storage
5. **Storage**: RESTful API endpoints handle CRUD operations
6. **Analysis**: Geometry calculations provide real-time feedback on layout efficiency

## External Dependencies

### UI and Styling
- **shadcn/ui**: Complete component library with Radix UI primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management with validation

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire stack
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- Vite dev server with Express middleware integration
- Hot reload for both frontend and backend changes
- Replit-specific optimizations and cartographer integration

### Production Build
- Frontend: Static assets built and served from Express
- Backend: Compiled TypeScript running on Node.js
- Single deployment target with unified serving strategy

### Database Migration Path
- Drizzle ORM configured for PostgreSQL integration
- Migration system ready for production database
- Environment-based configuration for database connections

## Changelog
```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```