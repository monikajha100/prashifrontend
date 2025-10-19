# Category Management System

## Overview
The category management system allows you to manage jewelry categories with custom images and make them clickable on the frontend with a beautiful slider interface.

## Features

### Admin Panel Features
- ✅ **Image Upload**: Upload custom category icons/images
- ✅ **Category Management**: Create, edit, delete categories
- ✅ **Sort Order**: Control the display order of categories
- ✅ **Active/Inactive Status**: Enable/disable categories
- ✅ **Image Preview**: See uploaded images before saving

### Frontend Features
- ✅ **Responsive Slider**: Displays up to 6 categories in a beautiful slider
- ✅ **Clickable Categories**: Each category links to its product page
- ✅ **Custom Images**: Uses uploaded category images or fallback icons
- ✅ **Mobile Responsive**: Adapts to different screen sizes
- ✅ **Smooth Animations**: Hover effects and transitions

## How to Use

### 1. Access Admin Panel
1. Go to `/admin` in your browser
2. Login with admin credentials
3. Navigate to "Categories" section

### 2. Add New Category
1. Click "Add New Category" button
2. Fill in the form:
   - **Name**: Category name (e.g., "Rings")
   - **Description**: Brief description (e.g., "Designer Rings")
   - **Image**: Upload a custom icon/image (optional)
   - **Sort Order**: Display order (1, 2, 3, etc.)
   - **Active**: Check to make category visible
3. Click "Save Category"

### 3. Edit Existing Category
1. Click "Edit" button on any category card
2. Modify the fields as needed
3. Upload a new image if desired
4. Click "Save Category"

### 4. Delete Category
1. Click "Delete" button on any category card
2. Confirm the deletion
3. Note: Categories with products cannot be deleted

## Frontend Display

### Category Slider
- **Desktop**: Shows 4 categories at once
- **Tablet**: Shows 3 categories at once  
- **Mobile**: Shows 2 categories at once
- **Navigation**: Arrow buttons and dot indicators
- **Clickable**: Each category links to `/products?category={slug}`

### Image Display
- **Custom Images**: Shows uploaded category images
- **Fallback**: Shows default emoji icons if no image uploaded
- **Styling**: Circular images with gold borders and hover effects

## Technical Details

### API Endpoints
- `GET /api/categories` - Get all active categories
- `GET /api/categories/admin` - Get all categories (admin)
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `POST /api/upload/image` - Upload category image

### Database Schema
```sql
categories:
- id (primary key)
- name (category name)
- slug (URL-friendly name)
- description (category description)
- image (image URL)
- is_active (boolean)
- sort_order (integer)
- created_at, updated_at
```

### File Structure
```
frontend/src/
├── admin/pages/AdminCategories.js (Admin interface)
├── components/CategorySlider.js (Frontend slider)
├── components/CategorySlider.css (Slider styles)
└── pages/Home.js (Updated to use slider)
```

## Sample Categories
The system comes with 6 sample categories:
1. **Rings** - Designer Rings
2. **Necklaces** - Statement Necklaces  
3. **Earrings** - Exclusive Earrings
4. **Bracelets** - Complete Range
5. **Sets** - Jewelry Sets
6. **Accessories** - Fashion Accessories

## Troubleshooting

### Image Upload Issues
- Ensure image files are under 5MB
- Supported formats: JPG, PNG, GIF, WebP
- Check admin token is valid

### Slider Not Showing
- Verify categories are marked as active
- Check browser console for API errors
- Ensure categories API is accessible

### Categories Not Clickable
- Verify category slugs are properly set
- Check that product pages exist for each category
- Ensure routing is configured correctly

## Customization

### Styling
Edit `CategorySlider.css` to customize:
- Colors and fonts
- Animation speeds
- Card layouts
- Responsive breakpoints

### Functionality
Edit `CategorySlider.js` to modify:
- Items per view
- Navigation behavior
- API endpoints
- Click handlers
