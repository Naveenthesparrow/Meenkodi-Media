# Directors & Heritage Specialists Admin System

## Overview
The Directors & Heritage Specialists section now has a complete admin management system that allows administrators to add, edit, delete, and reorder director cards directly from the website without code changes.

## Features

### For Public Users
- View beautifully designed director cards with animated gradients
- Click on director names to navigate to their dedicated poet pages
- Smooth horizontal slider with auto-scroll animation
- Bilingual support (English/Tamil)

### For Admin Users
- **Add New Directors**: Create new director cards with bilingual information
- **Edit Existing Directors**: Update director information, images, and positions
- **Delete Directors**: Remove directors from display
- **Reorder Directors**: Change the display order using up/down arrows
- **Live Image Preview**: See how images look before saving
- **Slug Management**: Auto-generated URLs for poet pages

## Setup Instructions

### 1. Database Seeding

To populate the database with the initial 5 directors:

```bash
cd server
node seedDirectors.js
```

**Note**: Make sure your MongoDB connection is configured in the `.env` file:
```
MONGO_URI=your_mongodb_connection_string
# or
MONGODB_URI=your_mongodb_connection_string
```

### 2. Verify API Routes

The following API endpoints are available:

- `GET /api/directors` - Get all active directors (public)
- `GET /api/directors/:id` - Get single director
- `POST /api/directors` - Create new director (admin only)
- `PUT /api/directors/:id` - Update director (admin only)
- `DELETE /api/directors/:id` - Delete director (admin only)
- `PUT /api/directors/reorder/all` - Reorder all directors (admin only)

### 3. Admin Access

To access the admin controls:
1. Log in as an admin user (user.role === 'admin')
2. Navigate to the Home page
3. Scroll to the "Directors & Heritage Specialists" section
4. The admin panel will appear below the director cards

## Usage Guide

### Adding a New Director

1. Click the **"Add New Director"** button at the top of the admin panel
2. Fill in the form:
   - **Language Toggle**: Switch between English and Tamil input
   - **Name**: Full name in both languages
   - **Title**: Professional title/description in both languages
   - **Image URL**: Link to director's image (Cloudinary, Wikimedia, etc.)
   - **Image Position**: CSS position value (e.g., "center top", "50% 20%")
   - **Slug**: URL-friendly identifier (auto-generated if left empty)
   - **Order**: Display position (higher numbers appear later)
3. Preview the image by clicking the **"Preview Image"** button
4. Click **"Create Director"** to save

### Editing a Director

1. Find the director card in the admin panel
2. Click the **Edit (pencil)** icon
3. Modify the fields as needed
4. Click **"Update Director"** to save changes

### Deleting a Director

1. Find the director card in the admin panel
2. Click the **Delete (trash)** icon
3. Confirm the deletion

### Reordering Directors

1. Click the **Up Arrow** or **Down Arrow** icons to move directors
2. The order updates immediately in the slider
3. Changes are saved to the database automatically

## Database Schema

Each director has the following structure:

```javascript
{
  name: { 
    en: String,  // English name
    ta: String   // Tamil name
  },
  title: { 
    en: String,  // English title
    ta: String   // Tamil title
  },
  image: String,        // Image URL
  imagePosition: String, // CSS position value
  slug: String,         // URL-friendly identifier (unique)
  order: Number,        // Display order
  isActive: Boolean,    // Visibility flag
  createdAt: Date,
  updatedAt: Date
}
```

## Technical Implementation

### Frontend Components

1. **DirectorsSlider.jsx**
   - Displays director cards with animated gradients
   - Handles auto-scroll animation
   - Supports bilingual content
   - Links to poet detail pages

2. **DirectorsAdmin.jsx**
   - Admin interface for CRUD operations
   - Material-UI Dialog for add/edit forms
   - Image preview functionality
   - Bilingual form with language toggle
   - Reordering with arrows
   - Success/error messaging

3. **Home.jsx**
   - Fetches directors from API on mount
   - Passes data to DirectorsSlider
   - Conditionally renders DirectorsAdmin for admins
   - Fetches current user for authentication

### Backend Components

1. **Director.js (Model)**
   - Mongoose schema with bilingual fields
   - Slug auto-generation middleware
   - Unique slug validation
   - Timestamps

2. **directors.js (Routes)**
   - RESTful API endpoints
   - Admin authentication middleware
   - Error handling
   - Reordering logic

3. **seedDirectors.js (Seed Script)**
   - Populates database with initial data
   - Safe to run multiple times (clears existing data)
   - Uses same env variables as main server

## Security

- All write operations (POST, PUT, DELETE) require admin authentication
- Routes protected with `isAdmin` middleware
- Checks `req.user.role === 'admin'`
- Public endpoints (GET) accessible without authentication

## Troubleshooting

### Directors not appearing
- Check MongoDB connection is active
- Run the seed script to populate initial data
- Verify API endpoint responds: `GET /api/directors`
- Check browser console for fetch errors

### Admin panel not visible
- Ensure you're logged in as an admin user
- Check `user.role === 'admin'` in browser console
- Verify session cookies are present

### Image not displaying
- Verify image URL is accessible
- Check CORS settings for external images
- Ensure imagePosition CSS is valid
- Test URL in browser directly

### Slug conflicts
- Each slug must be unique
- Use descriptive, URL-friendly names
- System will reject duplicate slugs
- Edit existing director to change slug

## Future Enhancements

Potential improvements:
- Drag-and-drop reordering
- Image upload to Cloudinary from admin panel
- Bulk import/export functionality
- Social media links per director
- Director bio/description field
- Search/filter in admin panel
- Activity logs for admin actions

## Code Files Modified

- ✅ `client/src/components/Home.jsx` - Integrated admin system
- ✅ `client/src/components/DirectorsSlider.jsx` - Visual redesign
- ✅ `client/src/components/DirectorsAdmin.jsx` - Admin UI (new)
- ✅ `server/models/Director.js` - Database model (new)
- ✅ `server/routes/directors.js` - API routes (new)
- ✅ `server/seedDirectors.js` - Seed script (new)
- ✅ `server/index.js` - Added Director model import and routes

## Related Pages

Directors link to their poet detail pages using the slug:
- URL format: `/explore/poets/:slug`
- Example: `/explore/poets/thiruvalluvar`
- Ensure PoetDetail.jsx component handles these slugs

## Support

For issues or questions:
1. Check browser console for errors
2. Verify MongoDB connection
3. Check server logs
4. Ensure user has admin role
5. Test API endpoints directly

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: ✅ Production Ready
