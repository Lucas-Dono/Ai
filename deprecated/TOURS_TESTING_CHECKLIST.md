# Tour System - Testing Checklist

## 🧪 Pre-Deployment Testing Checklist

### 1. Core Tour Functionality

#### Tour Navigation
- [ ] Click "Tours" button in navbar opens dropdown menu
- [ ] All 6 tours are visible in the menu
- [ ] Clicking a tour starts it correctly
- [ ] "Next" button advances to next step
- [ ] "Back" button returns to previous step (disabled on first step)
- [ ] "Skip Tour" dismisses the tour
- [ ] Completing last step shows "Complete" button
- [ ] Clicking "Complete" finishes tour and shows reward
- [ ] Tour card positions correctly relative to target elements
- [ ] Spotlight highlights target elements with pulsing animation

#### Tour Progress Tracking
- [ ] Completed tours show checkmark ✓ in menu
- [ ] Progress bar shows correct percentage
- [ ] Percentage updates after completing a tour
- [ ] Progress persists after page refresh
- [ ] "Reset Progress" clears all completed tours
- [ ] Reset confirmation works correctly

### 2. Gamification System

#### Reward Notification
- [ ] Reward modal appears after completing a tour
- [ ] Confetti animation plays
- [ ] Correct karma amount displays
- [ ] Badge displays with correct icon and rarity
- [ ] Badge description shows correctly
- [ ] Unlocked feature displays if applicable
- [ ] Modal dismisses after 5 seconds (auto-dismiss)
- [ ] Manual dismiss (click outside) works
- [ ] Multiple completions don't duplicate rewards

#### Badge Collection
- [ ] Completed tour badges persist in localStorage
- [ ] Badge rarity colors display correctly:
  - Common: Gray
  - Rare: Blue
  - Epic: Purple
  - Legendary: Gold
- [ ] All 6 badges can be collected
- [ ] Master badge (🏆) appears after all tours completed
- [ ] Master badge gives 500 bonus karma

#### Karma System
- [ ] Karma accumulates correctly:
  - Welcome: +50
  - First Agent: +100
  - Chat Basics: +75
  - Community Tour: +150
  - Worlds Intro: +200
  - Plans & Features: +125
  - Master Badge: +500
- [ ] Total karma displays in menu (if implemented)
- [ ] Karma persists in localStorage

### 3. Experience Level System

#### Level Detection
- [ ] New user shows as "🌱 Beginner"
- [ ] Level badge displays correct icon and color
- [ ] Level description shows correctly (ES/EN)
- [ ] Progress bar to next level displays
- [ ] Progress percentage calculates correctly
- [ ] Level updates when user stats change

#### Tour Filtering
- [ ] "Show recommended" shows filtered tours for current level
- [ ] "Show all tours" displays all 6 tours
- [ ] Toggle button works correctly
- [ ] Recommended badge appears on suggested tours
- [ ] Tour count badge shows correct number
- [ ] Different levels see different recommendations:
  - Beginner: Welcome, First Agent, Chat Basics
  - Intermediate: + Community Tour
  - Advanced: + Worlds Intro, Plans & Features
  - Expert: All tours

#### Stats API
- [ ] `/api/user/onboarding-stats` endpoint responds
- [ ] Returns correct user statistics
- [ ] Requires authentication
- [ ] Calculates `daysSinceSignup` correctly
- [ ] Fetches real data from database

### 4. Contextual Hints

#### Trigger System
- [ ] Hints appear when conditions are met
- [ ] Hint displays correct message
- [ ] "Start Tour" button launches correct tour
- [ ] "Dismiss" hides the hint
- [ ] Cooldown prevents spam (respects show limits)
- [ ] Hints don't appear during active tour
- [ ] Check interval works (every 30 seconds)

#### Animations
- [ ] Hint floats gently (vertical animation)
- [ ] Lightbulb icon rotates subtly
- [ ] Entrance animation (slide up + fade in)
- [ ] Exit animation (slide down + fade out)
- [ ] Animations are smooth and not jarring

### 5. Animations & Visual Effects

#### TourOverlay Animations
- [ ] Backdrop fades in smoothly
- [ ] Spotlight appears with scale animation
- [ ] Spotlight pulses with box-shadow effect
- [ ] Card slides up when appearing
- [ ] Card slides down when exiting
- [ ] Step transitions animate smoothly
- [ ] No flickering or layout shifts

#### Experience Badge Shimmer
- [ ] Shimmer effect animates across badge
- [ ] Animation repeats continuously
- [ ] Shimmer is subtle, not distracting
- [ ] Works in both light and dark mode

#### Button Interactions
- [ ] Hover states work correctly
- [ ] Click feedback is immediate
- [ ] Loading states display if needed
- [ ] Disabled states are clear

### 6. Mobile Responsiveness

#### Small Screens (< 768px)
- [ ] Tour card fits within viewport
- [ ] Card width: `calc(100vw - 2rem)`
- [ ] All text is readable
- [ ] Buttons are tappable (44px+ touch targets)
- [ ] No horizontal scrolling
- [ ] Backdrop covers entire screen
- [ ] Spotlight scales correctly
- [ ] Reward notification fits screen
- [ ] Contextual hints fit screen width
- [ ] Menu dropdown displays correctly

#### Medium Screens (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Card max-width applies (400px)
- [ ] Spacing is comfortable
- [ ] Touch targets remain adequate

#### Large Screens (> 1024px)
- [ ] Desktop layout renders correctly
- [ ] Positioning is optimal
- [ ] No wasted space
- [ ] Animations are smooth

#### Orientation Changes
- [ ] Portrait to landscape transition works
- [ ] Landscape to portrait transition works
- [ ] Card repositions correctly
- [ ] No layout breaking

### 7. Internationalization (i18n)

#### Spanish (ES)
- [ ] All tour names translated
- [ ] All tour descriptions translated
- [ ] All step titles translated
- [ ] All step descriptions translated
- [ ] Button labels translated
- [ ] Badge names translated
- [ ] Badge descriptions translated
- [ ] Level names translated
- [ ] Level descriptions translated
- [ ] Contextual hint messages in Spanish

#### English (EN)
- [ ] All tour names translated
- [ ] All tour descriptions translated
- [ ] All step titles translated
- [ ] All step descriptions translated
- [ ] Button labels translated
- [ ] Badge names translated
- [ ] Badge descriptions translated
- [ ] Level names translated
- [ ] Level descriptions translated
- [ ] Contextual hint messages in English

#### Language Switching
- [ ] Switching language updates all text immediately
- [ ] No text remains in wrong language
- [ ] Tours update when language changes
- [ ] Menu updates when language changes
- [ ] Progress persists across language changes

### 8. Data Persistence

#### LocalStorage
- [ ] `onboardingProgress` saves correctly
- [ ] `onboardingBadges` saves correctly
- [ ] `onboardingKarma` saves correctly
- [ ] `contextualTriggers` saves show counts
- [ ] Data persists after browser close
- [ ] Data persists after page refresh
- [ ] Reset clears data correctly

#### State Management
- [ ] OnboardingContext updates correctly
- [ ] Component re-renders when state changes
- [ ] No unnecessary re-renders
- [ ] State synchronizes across components

### 9. Edge Cases

#### User Interactions
- [ ] Rapid clicking doesn't break anything
- [ ] Opening multiple tours simultaneously is prevented
- [ ] Closing browser mid-tour saves state
- [ ] Refreshing mid-tour resumes correctly
- [ ] Network errors don't crash the app

#### Data Edge Cases
- [ ] New user (no data) displays correctly
- [ ] Corrupted localStorage is handled
- [ ] Missing translations fallback gracefully
- [ ] Invalid tour IDs are handled
- [ ] API errors display user-friendly message

#### Browser Compatibility
- [ ] Works in Chrome/Edge (Chromium)
- [ ] Works in Firefox
- [ ] Works in Safari (desktop & iOS)
- [ ] Works in Chrome Android
- [ ] Works in Samsung Internet
- [ ] No console errors
- [ ] No console warnings (except expected Sentry/Prisma)

### 10. Performance

#### Load Times
- [ ] Tours load instantly (no delay)
- [ ] Animations don't cause jank
- [ ] 60 FPS maintained during animations
- [ ] No memory leaks
- [ ] LocalStorage operations are fast

#### Bundle Size
- [ ] canvas-confetti loads on-demand
- [ ] No bloated dependencies
- [ ] Tree-shaking works correctly
- [ ] Code splitting is optimal

### 11. Accessibility

#### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All buttons are focusable
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Focus trap works in modals
- [ ] Focus returns after modal close

#### Screen Readers
- [ ] Tour steps are announced
- [ ] Buttons have clear labels
- [ ] Progress is announced
- [ ] Rewards are announced
- [ ] ARIA attributes are correct

#### Visual
- [ ] Text contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator
- [ ] Animations can be reduced (respect prefers-reduced-motion)

### 12. Security

#### Authentication
- [ ] API endpoints require auth
- [ ] Unauthenticated users get 401
- [ ] Session validation works
- [ ] CSRF protection active

#### Data Validation
- [ ] Input sanitization works
- [ ] XSS prevention active
- [ ] SQL injection prevention active
- [ ] No sensitive data in localStorage

---

## ✅ Checklist Summary

### Critical (Must Pass)
- [ ] All tours completable
- [ ] Rewards display correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Data persists correctly

### Important (Should Pass)
- [ ] Animations smooth
- [ ] i18n works correctly
- [ ] Experience levels accurate
- [ ] Contextual hints appear
- [ ] Accessibility basics met

### Nice to Have (Good to Pass)
- [ ] Performance optimal
- [ ] All edge cases handled
- [ ] Advanced accessibility
- [ ] Perfect browser compatibility

---

## 🐛 Bug Reporting Template

When you find a bug, use this template:

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Video**:
[If applicable]

**Environment**:
- Browser:
- OS:
- Screen Size:
- Language:

**Console Errors**:
```
[Paste any errors]
```

**Additional Context**:
[Any other relevant information]
```

---

## 📊 Test Results Template

After testing, document results:

```
**Test Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Environment**: [Browser, OS, Device]

**Tests Passed**: X / Y
**Critical Issues**: X
**High Priority Issues**: X
**Medium Priority Issues**: X
**Low Priority Issues**: X

**Notes**:
- [Any observations]
- [Recommendations]
```

---

## 🚀 Ready for Production?

Before deploying, ensure:
- [ ] All critical tests pass
- [ ] No console errors
- [ ] Mobile tested on real devices
- [ ] Both languages tested
- [ ] Performance is acceptable
- [ ] Stakeholder approval obtained
- [ ] Documentation complete
- [ ] Rollback plan ready

**Sign-off**: _______________  **Date**: _______________
