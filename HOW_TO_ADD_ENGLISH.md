# How to Add English Translations Manually

You have **3 options** to add English translations:

---

## Option 1: Interactive Mode (Easiest) ⭐

Run the script in interactive mode - it will prompt you for each event:

```powershell
cd server
node add-english-translations.js -i
```

**What happens:**
1. Shows you each event's Tamil content
2. Asks if you want to update it
3. Prompts you to type English translations
4. Saves automatically

**Example:**
```
📌 Event: பொங்கல் திருவிழா
   Tamil Description: ஜனவரியில் தமிழர்களால் கொண்டாடப்படும்...
   
   Update this event? (y/n): y
   English Title: Pongal Festival
   English Description: Harvest festival celebrated by Tamils in January
   English Location: Chennai
   ✅ Updated!
```

---

## Option 2: Edit Script & Run (Batch Mode)

1. Open `server/add-english-translations.js`
2. Find the `translations` object (around line 25)
3. Add your translations:

```javascript
const translations = {
  'பொங்கல் திருவிழா': {
    title: 'Pongal Festival',
    description: 'Harvest festival celebrated by Tamils in January.',
    location: 'Chennai'
  },
  'சித்திரை திருவிழா': {
    title: 'Chithirai Festival',
    description: 'Grand festival in Madurai with processions and celebrations.',
    location: 'Madurai'
  },
  // Add more here...
};
```

4. Run the script:
```powershell
cd server
node add-english-translations.js
```

---

## Option 3: Through Admin Portal

Use your existing admin interface to edit events:

1. Go to Events page
2. Click "Edit" on any event
3. You'll now see bilingual fields:
   - **Title (English)** and **தலைப்பு (தமிழ்)**
   - **Description (English)** and **விவரம் (தமிழ்)**
   - **Location (English)** and **இடம் (தமிழ்)**
4. Fill in the English fields
5. Click Save

---

## Option 4: Direct Database Update (MongoDB Compass)

If you use MongoDB Compass:

1. Open your database
2. Navigate to the `events` collection
3. Find an event and click Edit
4. Update the fields:

```json
{
  "title": {
    "en": "Pongal Festival",
    "ta": "பொங்கல் திருவிழா"
  },
  "description": {
    "en": "Harvest festival celebrated by Tamils in January.",
    "ta": "ஜனவரியில் தமிழர்களால் கொண்டாடப்படும் அறுவடைத் திருவிழா."
  },
  "location": {
    "en": "Chennai",
    "ta": "சென்னை"
  }
}
```

---

## Quick Reference: Your Current Events

Based on the screenshot, you have at least:

### Event 1: பொங்கல் திருவிழா
- **English Title:** Pongal Festival
- **English Description:** Annual harvest festival celebrated by Tamils in January
- **English Location:** Chennai

### Event 2: சித்திரை திருவிழா
- **English Title:** Chithirai Festival  
- **English Description:** Grand festival celebrated in Madurai, featuring traditional processions, cultural programs, and celebrations
- **English Location:** Madurai

---

## Recommended Approach

**Start with Option 1 (Interactive Mode)** - it's the easiest and safest way to add translations one by one without making mistakes.

```powershell
cd server
node add-english-translations.js -i
```

Then just answer the prompts! 🎉
