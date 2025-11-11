# Bilingual Content Support - Implementation Guide

## Problem
Current database has content only in Tamil (with some formatting issues), but you need to support both English and Tamil languages dynamically.

## Solution Overview
Transform single-language fields into bilingual objects that store both English and Tamil versions.

### Before (Current):
```javascript
{
  title: "பொங்கல் திருவிழா",
  description: "ஜனவரியில் தமிழர்களால் கொண்டாடப்படும் அறுவடைத் திருவிழா."
}
```

### After (Bilingual):
```javascript
{
  title: {
    en: "Pongal Festival",
    ta: "பொங்கல் திருவிழா"
  },
  description: {
    en: "Harvest festival celebrated by Tamils in January.",
    ta: "ஜனவரியில் தமிழர்களால் கொண்டாடப்படும் அறுவடைத் திருவிழா."
  }
}
```

---

## Step-by-Step Implementation

### 1️⃣ Run Database Migration

The migration script will convert existing single-language fields to bilingual format:

```powershell
cd server
node add-bilingual-support.js
```

**What it does:**
- ✅ Preserves existing Tamil content in the `ta` field
- ✅ Adds placeholder English text in the `en` field (you'll fill this in later)
- ✅ Safe to run multiple times (skips already migrated documents)
- ✅ Migrates all collections: Events, Temples, Kings, Literature, Dance, Foods, Festivals, Clothing, Ancient Science

### 2️⃣ Update Mongoose Schemas

Replace existing models with bilingual versions. Example for Events:

**Before:**
```javascript
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  // ...
});
```

**After:**
```javascript
const eventSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  description: {
    en: { type: String },
    ta: { type: String }
  },
  location: {
    en: { type: String },
    ta: { type: String }
  },
  // ...
});
```

I've created a sample updated model: `server/models/Event.bilingual.js`

**To apply:**
1. Backup your current `Event.js`
2. Replace it with content from `Event.bilingual.js`
3. Repeat for other models (Temple.js, King.js, etc.)

### 3️⃣ Update Frontend Components

Use the `useBilingualContent` hook to display content in the selected language:

**Before:**
```javascript
<Typography variant="h5">{event.title}</Typography>
<Typography>{event.description}</Typography>
```

**After:**
```javascript
import { useBilingualContent } from '../utils/bilingualContent';

function Events() {
  const getContent = useBilingualContent();
  
  return (
    <Typography variant="h5">{getContent(event.title)}</Typography>
    <Typography>{getContent(event.description)}</Typography>
  );
}
```

The hook automatically:
- ✅ Detects current language from i18next
- ✅ Returns appropriate language version
- ✅ Falls back to English if Tamil missing (or vice versa)
- ✅ Works with legacy single-string data

### 4️⃣ Update Admin Portal Forms

Modify admin forms to accept both English and Tamil input:

```javascript
<TextField
  label="Title (English)"
  value={event.title?.en || ''}
  onChange={(e) => setEvent({
    ...event,
    title: { ...event.title, en: e.target.value }
  })}
/>
<TextField
  label="தலைப்பு (தமிழ்)"
  value={event.title?.ta || ''}
  onChange={(e) => setEvent({
    ...event,
    title: { ...event.title, ta: e.target.value }
  })}
/>
```

### 5️⃣ Update API Responses

The API will automatically return bilingual objects. No backend changes needed beyond schema updates.

---

## Files Created

1. **`server/add-bilingual-support.js`**
   - Migration script to convert database
   - Run once to migrate all collections

2. **`server/models/Event.bilingual.js`**
   - Example updated schema
   - Use as template for other models

3. **`client/src/utils/bilingualContent.js`**
   - Frontend utility functions
   - `useBilingualContent()` hook for components
   - `getBilingualContent()` for standalone use

---

## Quick Start Commands

```powershell
# 1. Backup your database first!
# 2. Run migration
cd server
node add-bilingual-support.js

# 3. Test the changes
npm run dev
```

---

## Adding English Translations

After migration, you'll need to add English translations:

### Option A: Via Admin Portal
Update your admin forms to show both language fields (see step 4)

### Option B: Direct Database Update
Use MongoDB Compass or a script:

```javascript
db.events.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      "title.en": "Pongal Festival",
      "description.en": "Harvest festival celebrated by Tamils in January."
    }
  }
);
```

### Option C: Bulk Update Script
Create a script to batch-translate (using AI or manual mapping).

---

## Benefits

✅ **Automatic Language Switching** - Content changes based on user's language selection
✅ **Backward Compatible** - Works with existing single-language data
✅ **SEO Friendly** - Better search engine visibility in both languages
✅ **Better UX** - Users can read content in their preferred language
✅ **Maintainable** - Clear separation of languages in database

---

## Troubleshooting

**Q: Migration failed with connection error**
A: Check `MONGODB_URI` in your `.env` file

**Q: Old data still showing**
A: Clear browser cache and restart dev server

**Q: Admin forms not saving bilingual data**
A: Update API routes to handle bilingual object structure

**Q: Want to add a third language?**
A: Extend the schema: `{ en: String, ta: String, hi: String }` and update helper functions

---

## Next Steps

1. ✅ Run migration script
2. ✅ Update all model schemas
3. ✅ Update frontend components one by one
4. ✅ Update admin portal forms
5. ✅ Add English translations for existing content
6. ✅ Test language switching
7. ✅ Deploy to production

Need help with any step? Just ask! 🚀
