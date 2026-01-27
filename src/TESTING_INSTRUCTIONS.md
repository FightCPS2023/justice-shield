# CPS Punisher - Accessibility & Disclaimer Testing Instructions

## 🎯 Quick Test Checklist

Before deployment, run through this checklist to verify all accessibility features and disclaimers are working correctly.

### ✅ Quick 5-Minute Smoke Test

1. **Load App**
   - [ ] Legal disclaimer modal appears
   - [ ] Must accept before proceeding
   - [ ] Cannot close without accepting

2. **Keyboard Navigation**
   - [ ] Press Tab - skip link appears
   - [ ] Tab through all navigation tabs
   - [ ] Enter activates tabs correctly

3. **Disclaimers Visible**
   - [ ] Header banner disclaimer visible
   - [ ] State selector has proper labels
   - [ ] Footer disclaimer visible

4. **Mobile Responsive**
   - [ ] Resize browser to 375px width
   - [ ] No horizontal scrolling
   - [ ] All buttons are tappable

5. **Screen Reader Test (if available)**
   - [ ] Turn on screen reader
   - [ ] Navigate to main content
   - [ ] Verify tab labels are read aloud

---

## 📋 Comprehensive Testing Guide

### Part 1: Disclaimer Testing (15 minutes)

#### Test 1.1: Entry Disclaimer Modal
**Expected Behavior:**
- Modal appears on first visit
- Cannot be closed without accepting
- All checkboxes must be checked
- User type selection required
- Acceptance is saved in localStorage

**Steps:**
1. Clear localStorage (`localStorage.clear()` in console)
2. Refresh page
3. Verify modal appears
4. Try to close without accepting (should not close)
5. Check all checkboxes
6. Click Accept
7. Verify modal closes
8. Refresh page
9. Verify modal does NOT reappear

**Pass Criteria:** ✅ Modal works as expected, saves acceptance

#### Test 1.2: Header Disclaimer
**Expected Behavior:**
- Always visible at top of main content
- Has proper ARIA labels
- Shows storage mode

**Steps:**
1. Log in to app
2. Scroll down page
3. Verify header disclaimer is visible
4. Check for "Educational Tool - Not Legal Advice" text
5. Verify shield icon is present
6. Check for storage indicator (Cloud or Local)

**Pass Criteria:** ✅ Header disclaimer always visible and properly formatted

#### Test 1.3: Component-Level Disclaimers
**Test Each Section:**

##### Documents Section
1. Navigate to Documents tab
2. Upload a document
3. After AI analysis, verify:
   - [ ] AI content disclaimer appears above analysis
   - [ ] Warning about AI accuracy is visible
   - [ ] Disclaimer has proper styling (blue background)

##### Violation Checker
1. Navigate to Violations tab
2. Verify disclaimers appear:
   - [ ] Educational tool disclaimer (purple)
   - [ ] Data accuracy disclaimer (red)
   - [ ] Both are compact format

##### Defense Strategy
1. Navigate to Defense tab
2. Verify:
   - [ ] Legal disclaimer appears at top (amber)
   - [ ] Warning about consulting attorney
   - [ ] Compact format

##### Rights Guide
1. Navigate to Rights tab
2. Verify:
   - [ ] Legal disclaimer (amber)
   - [ ] Educational disclaimer (purple)
   - [ ] Both disclaimers visible before content

**Pass Criteria:** ✅ All sections have appropriate disclaimers

#### Test 1.4: Footer Disclaimer
**Expected Behavior:**
- Appears at bottom of every page/tab
- Comprehensive legal language
- Copyright notice

**Steps:**
1. Navigate to each major tab
2. Scroll to bottom
3. Verify footer disclaimer is present
4. Check for:
   - [ ] "No Attorney-Client Relationship"
   - [ ] "Accuracy" statement
   - [ ] "Limitation of Liability"
   - [ ] Copyright year

**Pass Criteria:** ✅ Footer appears on all pages with complete text

---

### Part 2: Accessibility Testing (30 minutes)

#### Test 2.1: Keyboard Navigation

##### Skip Link Test
**Steps:**
1. Refresh page
2. Press Tab once
3. Verify "Skip to main content" link appears
4. Press Enter
5. Verify focus moves to main content

**Pass Criteria:** ✅ Skip link works correctly

##### Tab Order Test
**Steps:**
1. Refresh page
2. Press Tab repeatedly
3. Verify focus moves logically through:
   - [ ] Header elements
   - [ ] Navigation tabs (left to right)
   - [ ] Main content
   - [ ] Buttons and inputs
4. Never stuck in an element (no keyboard trap)
5. Focus indicator is clearly visible (3px outline)

**Pass Criteria:** ✅ Logical tab order, visible focus, no traps

##### Keyboard Controls Test
**Steps:**
1. Navigate to Documents tab using keyboard only:
   - [ ] Tab to tab selector
   - [ ] Use Arrow keys or Tab to Documents
   - [ ] Press Enter to activate
2. Test button activation:
   - [ ] Tab to "Add Document" button
   - [ ] Press Enter - modal opens
   - [ ] Press Escape - modal closes
3. Test checkbox:
   - [ ] Navigate to Violations tab
   - [ ] Tab to a checkbox
   - [ ] Press Space to toggle

**Pass Criteria:** ✅ All controls work via keyboard

#### Test 2.2: Screen Reader Testing

##### NVDA/JAWS (Windows) Test
**Steps:**
1. Start NVDA (Insert + Ctrl + N) or JAWS
2. Navigate to app
3. Listen for:
   - [ ] Page title announced
   - [ ] "Banner" region announced for header
   - [ ] Tab labels read correctly
   - [ ] Button labels are descriptive
   - [ ] Form labels read with inputs
4. Navigate with screen reader keys:
   - [ ] H key - jumps between headings
   - [ ] D key - jumps between landmarks
   - [ ] B key - jumps between buttons

**Pass Criteria:** ✅ All elements announced correctly

##### VoiceOver (Mac) Test
**Steps:**
1. Enable VoiceOver (Cmd + F5)
2. Navigate to app
3. Use VoiceOver commands:
   - [ ] VO + Right Arrow - navigate elements
   - [ ] VO + U - open rotor
   - [ ] Select "Headings" - verify hierarchy
   - [ ] Select "Form Controls" - verify all labeled
4. Verify announcements:
   - [ ] Buttons read with "button" suffix
   - [ ] Links read with "link" suffix
   - [ ] Images with alt text or marked decorative

**Pass Criteria:** ✅ Full VoiceOver compatibility

#### Test 2.3: Visual Accessibility

##### Font Size Test
**Steps:**
1. Go to Settings → Accessibility tab
2. Click "Large" font size
3. Verify text increases
4. Refresh page
5. Verify large font persists
6. Test "Extra Large"
7. Return to "Normal"

**Pass Criteria:** ✅ Font sizes work and persist

##### High Contrast Test
**Steps:**
1. Go to Settings → Accessibility
2. Click "Toggle High Contrast Mode"
3. Verify:
   - [ ] Colors become more contrasted
   - [ ] Text remains readable
   - [ ] Buttons still visible
4. Refresh page
5. Verify high contrast persists
6. Toggle off

**Pass Criteria:** ✅ High contrast works and persists

##### Browser Zoom Test
**Steps:**
1. Press Ctrl/Cmd + (Plus) to zoom to 200%
2. Verify:
   - [ ] No horizontal scrolling
   - [ ] All text is readable
   - [ ] Buttons don't overlap
   - [ ] Content reflows properly
3. Test at 150% and 125%
4. Return to 100%

**Pass Criteria:** ✅ No issues up to 200% zoom

##### Color Contrast Test
**Steps:**
1. Install axe DevTools extension
2. Open DevTools (F12)
3. Go to axe tab
4. Click "Scan ALL of my page"
5. Check for contrast issues
6. All should pass WCAG AA (4.5:1 ratio)

**Pass Criteria:** ✅ No contrast violations

##### Focus Indicator Test
**Steps:**
1. Tab through interface
2. Verify every interactive element shows:
   - [ ] 3px solid outline
   - [ ] Primary color (red)
   - [ ] 2px offset from element
   - [ ] Visible on all backgrounds
3. Test in dark mode
4. Verify focus still visible

**Pass Criteria:** ✅ Focus indicators always visible

#### Test 2.4: Touch & Mobile Testing

##### Mobile Device Test (Real Device Preferred)
**Steps:**
1. Open app on mobile device (or use DevTools device mode)
2. Test at 375px width (iPhone SE)
3. Verify:
   - [ ] No horizontal scrolling
   - [ ] All buttons are at least 44px tall
   - [ ] Tabs are tappable (not too small)
   - [ ] Text is readable without zooming
   - [ ] Forms are usable
   - [ ] Modals fit on screen
4. Test at 320px (smallest phones)
5. Test at 768px (tablet)

**Pass Criteria:** ✅ Full functionality on mobile

##### Touch Target Test
**Steps:**
1. On mobile device
2. Try tapping each button with finger
3. Verify:
   - [ ] No missed taps
   - [ ] No accidental taps on nearby elements
   - [ ] Comfortable spacing between tappable items
4. Test in landscape orientation

**Pass Criteria:** ✅ All touch targets easily tappable

##### Gesture Test
**Steps:**
1. Verify app works without complex gestures
2. All actions available via simple tap
3. No swipe-only features
4. No pinch-only features

**Pass Criteria:** ✅ Simple gestures only

#### Test 2.5: Motion & Animation

##### Reduced Motion Test
**Steps:**
1. Enable reduced motion in OS settings:
   - **Windows:** Settings → Ease of Access → Display → Show animations
   - **Mac:** System Preferences → Accessibility → Display → Reduce motion
   - **iOS:** Settings → Accessibility → Motion → Reduce Motion
2. Refresh app
3. Verify:
   - [ ] Animations are disabled or very short
   - [ ] Page transitions are instant
   - [ ] No smooth scrolling
   - [ ] App remains usable

**Pass Criteria:** ✅ Respects reduced motion preference

---

### Part 3: Automated Testing (10 minutes)

#### Test 3.1: Lighthouse Audit
**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" only
4. Click "Analyze page load"
5. Wait for results
6. Target: 95+ score

**Pass Criteria:** ✅ Lighthouse score 95 or higher

#### Test 3.2: axe DevTools Scan
**Steps:**
1. Install axe DevTools extension
2. Open DevTools → axe tab
3. Click "Scan ALL of my page"
4. Review results
5. Target: 0 violations

**Pass Criteria:** ✅ Zero critical or serious violations

#### Test 3.3: WAVE Tool Scan
**Steps:**
1. Install WAVE extension
2. Click WAVE icon
3. Review summary
4. Check for:
   - [ ] All images have alt text or aria-hidden
   - [ ] All form inputs have labels
   - [ ] Sufficient color contrast
   - [ ] Proper heading structure
5. Target: 0 errors

**Pass Criteria:** ✅ Zero errors (warnings acceptable)

---

## 🐛 Common Issues & Solutions

### Issue: Modal won't close with Escape key
**Solution:** Check FocusTrap implementation in modal components

### Issue: Tab order is illogical
**Solution:** Verify HTML structure follows visual layout

### Issue: Focus indicator not visible
**Solution:** Check CSS specificity - focus styles may be overridden

### Issue: Screen reader not announcing updates
**Solution:** Add aria-live="polite" to dynamic content regions

### Issue: Touch targets too small on mobile
**Solution:** Verify min-height: 44px is applied in CSS

### Issue: Text unreadable at 200% zoom
**Solution:** Use relative units (rem/em) instead of fixed pixels

### Issue: Disclaimer not appearing
**Solution:** Check localStorage - clear it to reset disclaimer acceptance

---

## 📊 Testing Report Template

```markdown
# Accessibility & Disclaimer Testing Report

**Date:** [Date]
**Tester:** [Name]
**Version:** [App Version]
**Browser:** [Chrome/Firefox/Safari] [Version]
**OS:** [Windows/Mac/Linux] [Version]

## Results Summary
- **Disclaimers:** [ ] Pass [ ] Fail
- **Keyboard Navigation:** [ ] Pass [ ] Fail
- **Screen Reader:** [ ] Pass [ ] Fail
- **Visual Accessibility:** [ ] Pass [ ] Fail
- **Mobile/Touch:** [ ] Pass [ ] Fail
- **Automated Tests:** [ ] Pass [ ] Fail

## Detailed Results
[List any failures or issues found]

## Recommendations
[List any improvements needed]

## Overall Status
[ ] Ready for Production
[ ] Needs Minor Fixes
[ ] Needs Major Fixes

**Signed:** [Tester Name]
```

---

## 🚀 Pre-Deployment Checklist

Before deploying to production:

- [ ] All disclaimers tested and working
- [ ] Keyboard navigation fully functional
- [ ] Screen reader tested (at least one)
- [ ] Mobile responsive verified
- [ ] Lighthouse score 95+
- [ ] axe DevTools shows no critical issues
- [ ] WAVE scan shows no errors
- [ ] Focus indicators visible everywhere
- [ ] All text meets contrast requirements
- [ ] Touch targets meet 44px minimum
- [ ] High contrast mode tested
- [ ] Reduced motion tested
- [ ] Font size options tested
- [ ] Settings persistence verified
- [ ] Documentation updated

## ✅ Sign-Off

**Tested By:** ________________  
**Date:** ________________  
**Approved By:** ________________  
**Date:** ________________  

**Ready for Production:** [ ] YES [ ] NO

---

**Questions or Issues?** Contact the development team or file an accessibility issue in the issue tracker.
