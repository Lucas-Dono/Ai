# Smart Start - Complete User Flow

This document illustrates the complete user journey through the Smart Start wizard.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         START                                │
│                    User clicks                               │
│              "Create Character - Smart Start"                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 1: GENRE SELECTION                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Romance  │  │  Gaming  │  │Professional│                 │
│  │  ❤️      │  │  🎮      │  │  💼       │  (+ 3 more)     │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                              │
│  [Optional] Refine with Subgenre & Archetype                │
│                                                              │
│                    [Continue Button]                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: CHARACTER TYPE                          │
│                                                              │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │  EXISTING CHARACTER  │   │ ORIGINAL CHARACTER   │       │
│  │                      │   │                      │       │
│  │  🔍 Search for       │   │  ✨ Create from      │       │
│  │  characters from     │   │  scratch with AI     │       │
│  │  anime, games, etc.  │   │  assistance          │       │
│  └──────────────────────┘   └──────────────────────┘       │
│                                                              │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         │ [Existing]                        │ [Original]
         ▼                                   ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  STEP 3a: SEARCH        │     │  STEP 3b: CUSTOMIZE         │
│                         │     │                             │
│  ┌───────────────────┐  │     │  Name: ___________          │
│  │ Search: "Naruto" │🔍│     │                             │
│  └───────────────────┘  │     │  Appearance:                │
│                         │     │  ┌─────────────────┐        │
│  Results:               │     │  │                 │        │
│  ┌──────────────────┐   │     │  └─────────────────┘        │
│  │ 🖼️ Naruto Uzumaki│   │     │                             │
│  │ Ninja, Konoha    │→ │     │  Personality:               │
│  └──────────────────┘   │     │  ___________                │
│                         │     │                             │
│  ┌──────────────────┐   │     │  Background:                │
│  │ 🖼️ Naruto (Film) │   │     │  ┌─────────────────┐        │
│  │ Movie character  │   │     │  │                 │        │
│  └──────────────────┘   │     │  └─────────────────┘        │
│                         │     │                             │
│     [Select Result]     │     │  [✨ Generate with AI]      │
└────────┬────────────────┘     └──────────┬──────────────────┘
         │                                 │
         │ [Character extracted]           │ [AI generates profile]
         ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: CUSTOMIZE & REFINE                      │
│                                                              │
│  Name: Naruto Uzumaki                    ┌──────────────┐   │
│                                          │   PREVIEW    │   │
│  Appearance:                             │              │   │
│  ┌────────────────────────────┐          │  🧑 Naruto   │   │
│  │ Blonde hair, blue eyes,    │          │              │   │
│  │ orange jumpsuit...         │          │  Age: 17     │   │
│  └────────────────────────────┘          │  Ninja       │   │
│                                          │              │   │
│  Personality:                            │  Appearance: │   │
│  determined, loyal, energetic            │  [updates    │   │
│                                          │   live...]   │   │
│  Background:                             │              │   │
│  ┌────────────────────────────┐          │  Personality:│   │
│  │ Born with the Nine-Tails   │          │  [updates    │   │
│  │ sealed within him...       │          │   live...]   │   │
│  └────────────────────────────┘          └──────────────┘   │
│                                                              │
│              [Continue to Review]                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 5: REVIEW                              │
│                                                              │
│  ✅ CHARACTER SUMMARY                                        │
│                                                              │
│  Name             Naruto Uzumaki                             │
│  Appearance       Blonde hair, blue eyes, orange jumpsuit   │
│  Personality      Determined, loyal, energetic, never...    │
│  Background       Born with Nine-Tails sealed within...     │
│  Age              17                                         │
│  Occupation       Ninja                                      │
│                                                              │
│  Everything looks good?                                      │
│                                                              │
│    [← Go Back & Edit]    [✅ Create Character →]            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUCCESS!                              │
│                                                              │
│              ✨ Character Created ✨                          │
│                                                              │
│          Redirecting to character page...                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Step Breakdown

### Step 1: Genre Selection

**What the user sees:**
- 6 genre cards in a grid layout (2 cols mobile, 3 cols desktop)
- Each card shows: icon, title, description, tags
- Hover animation: slight lift + shadow
- Selected: primary ring + background tint

**User actions:**
- Click a genre card
- Optionally: expand to select subgenre
- Optionally: select archetype
- Click "Continue"

**Skip option:** Top-right "Skip" button at all times

**Preview:** Not visible yet (appears from Step 3)

---

### Step 2: Character Type

**What the user sees:**
- 2 large cards side by side (stacked on mobile)
- "Existing Character" - with search icon
- "Original Character" - with sparkles icon
- Clear descriptions under each

**User actions:**
- Click one of the two options
- Click "Continue"

**Navigation:**
- "Back" button now appears (returns to genre selection)

---

### Step 3a: Search (if Existing selected)

**What the user sees:**
- Large search input with search button
- Search results below (if searched)
- Each result shows: image, name, description, metadata
- Loading skeleton while searching
- Empty state if no results
- Error state if search fails

**User actions:**
- Type character name
- Press Enter or click Search
- Click a result to select it

**AI happens:**
- Backend searches multiple sources (MyAnimeList, AniList, TMDB, etc.)
- Character data is extracted automatically
- User proceeds to customization

---

### Step 3b: Customize (if Original selected)

**What the user sees:**
- Simple form with 4 fields:
  - Name (required)
  - Appearance (optional)
  - Personality (optional)
  - Background (optional)
- "Generate with AI" button
- Preview panel appears (desktop: right, mobile: button)

**User actions:**
- Fill in name (minimum)
- Click "Generate with AI"
- Or fill everything manually
- Click "Continue to Review"

**AI happens:**
- Generates complete character profile
- Fills in missing fields
- Based on genre, subgenre, archetype selected

**Preview:**
- Updates in real-time as user types
- Shows avatar, name, all filled fields

---

### Step 4: Customize & Refine

**What the user sees:**
- Same form as Step 3b
- Pre-filled with either:
  - Extracted data (if from search)
  - AI-generated data (if original)
- Can edit any field
- Preview updates live

**User actions:**
- Review auto-filled data
- Make any edits
- Optionally regenerate with AI (if original)
- Click "Continue to Review"

**Preview:**
- Sticky sidebar on desktop (always visible)
- Bottom sheet on mobile (tap "Preview" button)
- Shows complete character as it's being built

---

### Step 5: Review

**What the user sees:**
- Clean summary of all character fields
- Read-only display in cards
- All fields shown: name, appearance, personality, background, age, gender, etc.

**User actions:**
- Review everything
- Click "Go Back & Edit" if changes needed
- Click "Create Character" when satisfied

**Final action:**
- Character is created in database
- User redirected to character page
- Can continue customizing there

---

## Alternative Flows

### Skip Wizard

**Trigger:** Click "Skip" button (top-right, always visible)

**What happens:**
1. Confirmation dialog: "Are you sure?"
2. If yes: redirect to `/create-character` (manual form)
3. If no: stay in wizard

---

### Error Recovery

**Search fails:**
- Error message displays
- "Try Again" button
- Can go back or skip

**AI generation fails:**
- Error message displays
- Can retry generation
- Can proceed with partial data
- Can go back

**Character creation fails:**
- Error message displays
- Data is preserved
- Can retry creation
- Can go back to edit

---

## Keyboard Shortcuts

- `Enter` - Continue to next step (when valid)
- `Esc` - Go back to previous step
- `Cmd/Ctrl + K` - Skip wizard
- `Arrow Left` - Previous step (when enabled)
- `Tab` - Navigate between fields
- `Space` - Select cards/buttons

---

## Mobile Experience

### Differences from Desktop

1. **Layout:**
   - Single column everywhere
   - Cards stack vertically
   - Larger touch targets (min 44px)

2. **Preview:**
   - No sticky sidebar
   - Floating "Preview" button (bottom-right)
   - Bottom sheet modal on tap
   - Backdrop dismisses sheet

3. **Navigation:**
   - Breadcrumb wraps on small screens
   - Buttons full-width on mobile

4. **Forms:**
   - Larger input fields
   - Mobile keyboard optimization
   - Better spacing for thumbs

---

## Session Management

### Session Lifecycle

1. **Initialization:**
   - `POST /api/smart-start/session`
   - Server creates session with unique ID
   - Returns available genres

2. **Progress Tracking:**
   - `PATCH /api/smart-start/session` after each step
   - Tracks: current step, time spent, selections
   - Enables analytics and recovery

3. **Data Persistence:**
   - All selections saved in session
   - Character draft updated continuously
   - Preview always reflects latest state

4. **Completion:**
   - `POST /api/v2/characters/create`
   - Session marked as complete
   - Character ID linked to session

### Session Recovery

- Currently: refresh loses session (fresh start)
- Future: could implement localStorage backup

---

## Performance Characteristics

### Load Times

- **Initial load:** < 2s (session + genres)
- **Step transition:** < 200ms (with animation)
- **Search:** < 1s (with skeleton)
- **AI generation:** 2-5s (with progress)
- **Character creation:** < 1s

### Network Requests

- Session creation: 1 request
- Genre list: 1 request (cached)
- Search: 1 request per search
- Character extraction: 1 request
- AI generation: 1 request
- Character creation: 1 request

**Total minimum:** 3 requests (session + genres + create)
**Maximum:** 6-8 requests (if using search + generation)

---

## Analytics Tracking

### Events Captured

- `smart_start_initiated` - User starts wizard
- `genre_selected` - Genre choice made
- `character_type_selected` - Existing vs. Original
- `search_performed` - Character search executed
- `search_result_selected` - Result clicked
- `character_generated` - AI generation triggered
- `field_edited` - User edits a field
- `smart_start_completed` - Character created
- `smart_start_abandoned` - User skipped/left
- `step_skipped` - User skipped a step

### Metrics Tracked

- Time spent per step
- Completion rate
- Abandonment rate
- Most popular genres
- Search success rate
- AI generation usage
- Edit frequency

---

## Conclusion

The Smart Start wizard provides a **guided, intelligent, and delightful** character creation experience. Users can:

- Create characters in **5 simple steps**
- Leverage **AI assistance** throughout
- See **live previews** of their character
- **Skip** and use manual creation anytime
- Experience **professional design** on any device

The flow is **optimized for conversion** while maintaining **flexibility** for power users.
