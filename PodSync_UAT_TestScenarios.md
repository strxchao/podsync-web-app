# PodSync UAT - Detailed Test Scenarios & Evaluation Rubric

## Test Environment Setup

### Prerequisites
- [ ] PodSync backend running on http://localhost:3002
- [ ] PodSync frontend running on http://localhost:5173  
- [ ] Unity Digital Signage application running
- [ ] Google Sheets connected and accessible
- [ ] MySQL database with test data
- [ ] Test user accounts created

### Test Data Requirements
- [ ] At least 5 sample Google Forms submissions
- [ ] 3 different academic units represented
- [ ] Past, current, and future booking schedules
- [ ] Sample signage content (announcements, promotions)
- [ ] Various file types for media upload testing

---

## USER PERSONA TEST SCENARIOS

### Persona 1: Admin PodSync (Primary User)
**Background:** Technical staff responsible for managing the podcast lab system daily

#### Scenario A1: Daily System Management
```
GIVEN: Admin starts their work shift
WHEN: They access the PodSync dashboard
THEN: They should be able to quickly assess system status and take necessary actions

Test Steps:
1. Login to PodSync dashboard
2. Check current broadcast status
3. Review today's lab bookings
4. Verify Google Sheets sync status
5. Check for any system alerts or issues

Success Criteria:
- Dashboard loads within 3 seconds
- Current status is immediately visible
- Today's schedule is clearly displayed
- Sync status is current (within last 5 minutes)
- Any errors are prominently shown

Measurement:
Time to complete: _____ seconds
Errors encountered: _____
Satisfaction rating (1-5): _____
```

#### Scenario A2: Emergency Broadcast Control
```
GIVEN: Lab needs immediate OFF AIR due to emergency
WHEN: Admin needs to stop broadcast quickly
THEN: System should respond immediately and confirm the change

Test Steps:
1. Locate broadcast control on dashboard
2. Click to toggle OFF AIR
3. Confirm status change
4. Verify Unity display updates
5. Add emergency message if needed

Success Criteria:
- Control is prominent and easy to find
- Status changes within 2 seconds
- Confirmation is clear
- Unity updates within 30 seconds
- Option to add message is available

Measurement:
Time to toggle: _____ seconds
Unity update time: _____ seconds
Clarity rating (1-5): _____
```

#### Scenario A3: Content Management for Special Event
```
GIVEN: Lab has special event requiring signage announcement
WHEN: Admin creates new content with media
THEN: Content should be created easily and appear on signage

Test Steps:
1. Navigate to Signage Content
2. Create new announcement
3. Add title, description, and image
4. Set display priority and dates
5. Save and verify QR code generation
6. Check content appears on Unity display

Success Criteria:
- Content creation form is intuitive
- File upload works smoothly
- QR code generates automatically
- Content appears on signage within 60 seconds
- Display order is respected

Measurement:
Creation time: _____ minutes
Upload success: Yes/No
QR generation: Yes/No
Display time: _____ seconds
```

### Persona 2: Lab Manager (Supervisory User)
**Background:** Academic staff overseeing lab operations and bookings

#### Scenario B1: Weekly Schedule Review
```
GIVEN: Lab manager needs to review upcoming week's bookings
WHEN: They access schedule management
THEN: They should easily see and understand all bookings

Test Steps:
1. Access Schedule page
2. Filter by date range (next 7 days)
3. Group by academic unit
4. Check for conflicts or issues
5. Generate weekly report

Success Criteria:
- Schedule loads quickly with visual calendar
- Filters work intuitively
- Unit grouping is clear
- Conflicts are highlighted
- Export function works

Measurement:
Navigation time: _____ seconds
Filter effectiveness (1-5): _____
Conflict detection: Yes/No
Export success: Yes/No
```

#### Scenario B2: Analytics for Monthly Report
```
GIVEN: Manager needs lab usage statistics for monthly report
WHEN: They access analytics dashboard
THEN: They should get comprehensive usage insights

Test Steps:
1. Navigate to Analytics page
2. Select last month date range
3. Review usage by unit/prodi
4. Check peak hours analysis
5. Export data for institutional report

Success Criteria:
- Charts are clear and informative
- Date selection is intuitive
- Breakdowns are meaningful
- Export formats are useful
- Data accuracy is verifiable

Measurement:
Analysis time: _____ minutes
Chart clarity (1-5): _____
Export format usefulness (1-5): _____
```

### Persona 3: Mahasiswa/Dosen (End User)
**Background:** Users who book lab facilities through Google Forms

#### Scenario C1: Lab Booking Submission
```
GIVEN: Student needs to book lab for podcast recording
WHEN: They submit Google Form
THEN: Their booking should appear in PodSync system

Test Steps:
1. Fill out Google Form completely
2. Submit booking request
3. Wait for sync (up to 5 minutes)
4. Check if booking appears in PodSync schedule
5. Verify details are correct

Success Criteria:
- Form is clear and comprehensive
- All required fields are obvious
- Submission is confirmed
- Data appears accurately in system
- Timing information is correct

Measurement:
Form completion time: _____ minutes
Sync time: _____ minutes
Data accuracy: %_____
```

### Persona 4: Pengunjung Lab (Observer)
**Background:** Students and staff who check lab availability

#### Scenario D1: Checking Lab Status and Schedule
```
GIVEN: Visitor wants to know lab availability
WHEN: They view Unity Digital Signage
THEN: They should clearly understand current status and upcoming bookings

Test Steps:
1. Approach digital signage display
2. Read current ON AIR/OFF AIR status
3. Check current time and date
4. Review current booking (if any)
5. Check upcoming bookings list

Success Criteria:
- Status is immediately clear from distance
- Current information is accurate
- Upcoming schedule is easy to read
- Information updates in real-time
- QR codes are scannable

Measurement:
Visibility distance: _____ meters
Information clarity (1-5): _____
Update frequency: _____ seconds
QR code success rate: _____%
```

### Persona 5: Technical Operator (Maintenance User)
**Background:** IT staff responsible for system maintenance

#### Scenario E1: System Health Monitoring
```
GIVEN: Operator needs to verify system is functioning properly
WHEN: They check all system components
THEN: They should identify any issues and confirm proper operation

Test Steps:
1. Check PodSync backend API endpoints
2. Verify Unity connection status
3. Test Google Sheets sync manually
4. Review database health
5. Test error recovery procedures

Success Criteria:
- All endpoints respond properly
- Unity shows connection status
- Manual sync works
- Database is healthy
- Error handling works

Measurement:
Health check time: _____ minutes
Issues found: _____
Recovery success: Yes/No
```

---

## ACCESSIBILITY TESTING SCENARIOS

### Visual Accessibility
| Test | Description | Pass/Fail | Notes |
|------|-------------|-----------|-------|
| Color Contrast | Text meets WCAG AA standards (4.5:1 ratio) | __ | |
| Color Dependence | Information conveyed without color alone | __ | |
| Font Size | Text readable at normal zoom levels | __ | |
| Focus Indicators | Keyboard navigation shows clear focus | __ | |

### Motor Accessibility  
| Test | Description | Pass/Fail | Notes |
|------|-------------|-----------|-------|
| Keyboard Navigation | All functions accessible via keyboard | __ | |
| Click Targets | Buttons are at least 44px minimum | __ | |
| Timeout Handling | Sufficient time or adjustable timeouts | __ | |

### Cognitive Accessibility
| Test | Description | Pass/Fail | Notes |
|------|-------------|-----------|-------|
| Error Prevention | Clear validation and confirmation dialogs | __ | |
| Consistent Navigation | Navigation behaves predictably | __ | |
| Simple Language | Text uses plain, understandable language | __ | |

---

## PERFORMANCE TESTING SCENARIOS

### Load Time Testing
| Scenario | Target Time | Actual Time | Pass/Fail | Notes |
|----------|-------------|-------------|-----------|-------|
| Dashboard initial load | < 3 seconds | _____ | __ | |
| Schedule page with 100 entries | < 5 seconds | _____ | __ | |
| Analytics with 1 month data | < 10 seconds | _____ | __ | |
| Content upload (5MB file) | < 30 seconds | _____ | __ | |

### Responsiveness Testing
| Scenario | Target Response | Actual Response | Pass/Fail | Notes |
|----------|----------------|-----------------|-----------|-------|
| Broadcast toggle | < 2 seconds | _____ | __ | |
| Form submission | < 5 seconds | _____ | __ | |
| Unity status update | < 30 seconds | _____ | __ | |
| Google Sheets sync | < 5 minutes | _____ | __ | |

---

## BROWSER COMPATIBILITY TESTING

### Desktop Browsers
| Browser | Version | Dashboard | Schedule | Analytics | Content | Pass/Fail |
|---------|---------|-----------|----------|-----------|---------|-----------|
| Chrome | Latest | __ | __ | __ | __ | __ |
| Firefox | Latest | __ | __ | __ | __ | __ |
| Safari | Latest | __ | __ | __ | __ | __ |
| Edge | Latest | __ | __ | __ | __ | __ |

### Mobile Browsers
| Device Type | Browser | Dashboard | Schedule | Pass/Fail | Notes |
|-------------|---------|-----------|----------|-----------|-------|
| Android Phone | Chrome | __ | __ | __ | |
| iPhone | Safari | __ | __ | __ | |
| Tablet | Chrome | __ | __ | __ | |

---

## INTEGRATION TESTING SCENARIOS

### Google Sheets Integration
| Test Case | Expected Behavior | Result | Pass/Fail | Notes |
|-----------|-------------------|--------|-----------|-------|
| New form submission | Appears in PodSync within 5 min | __ | __ | |
| Modified entry | Updates reflected in system | __ | __ | |
| Deleted entry | Removed from active schedules | __ | __ | |
| Network interruption | Sync resumes when restored | __ | __ | |

### Unity Integration  
| Test Case | Expected Behavior | Result | Pass/Fail | Notes |
|-----------|-------------------|--------|-----------|-------|
| Status change from web | Unity updates within 30s | __ | __ | |
| Manual Unity toggle | Web dashboard reflects change | __ | __ | |
| Connection lost | Unity shows error state | __ | __ | |
| Connection restored | Normal operation resumes | __ | __ | |

---

## SECURITY TESTING SCENARIOS

### Authentication & Authorization
| Test Case | Expected Behavior | Result | Pass/Fail | Notes |
|-----------|-------------------|--------|-----------|-------|
| Invalid login attempt | Access denied with clear message | __ | __ | |
| Session timeout | Redirects to login page | __ | __ | |
| Direct URL access | Requires authentication | __ | __ | |
| API endpoint access | Validates permissions | __ | __ | |

### Data Security
| Test Case | Expected Behavior | Result | Pass/Fail | Notes |
|-----------|-------------------|--------|-----------|-------|
| File upload validation | Rejects malicious files | __ | __ | |
| SQL injection attempt | Query safely handled | __ | __ | |
| XSS attempt | Input properly sanitized | __ | __ | |
| Sensitive data exposure | No credentials in client code | __ | __ | |

---

## ERROR HANDLING TESTING

### Network Errors
| Scenario | User Action | Expected Response | Actual Response | Pass/Fail |
|----------|-------------|-------------------|-----------------|-----------|
| API server down | Try to load dashboard | Clear error message with retry option | __ | __ |
| Slow network | Submit form | Loading indicator with timeout handling | __ | __ |
| Intermittent connection | Use Unity display | Graceful degradation to cached data | __ | __ |

### Data Errors
| Scenario | User Action | Expected Response | Actual Response | Pass/Fail |
|----------|-------------|-------------------|-----------------|-----------|
| Invalid file upload | Upload wrong file type | Clear error with supported formats | __ | __ |
| Form validation | Submit incomplete form | Highlight required fields clearly | __ | __ |
| Date conflict | Create overlapping schedule | Prevent creation with explanation | __ | __ |

---

## TEST RESULTS SCORING RUBRIC

### Nielsen Heuristics Scoring
- **0 Points**: No usability problem
- **1 Point**: Cosmetic problem only
- **2 Points**: Minor usability problem (low priority)
- **3 Points**: Major usability problem (high priority)
- **4 Points**: Usability catastrophe (must fix)

### Overall System Score Calculation
```
Total Possible Score: 420 points (42 heuristic tests × 10 heuristics)

Scoring Ranges:
- 0-84 points (0-20%): Excellent usability
- 85-126 points (21-30%): Good usability with minor issues
- 127-210 points (31-50%): Acceptable with moderate issues
- 211-294 points (51-70%): Poor usability, needs improvement
- 295+ points (71%+): Unacceptable, major redesign needed
```

### Task Success Rate Calculation
```
Success Rate = (Completed Tasks / Total Tasks) × 100%

Rating Scale:
- 90-100%: Excellent
- 80-89%: Good
- 70-79%: Acceptable
- 60-69%: Needs improvement
- Below 60%: Unacceptable
```

### Recommendations Priority Matrix
```
High Impact + High Effort = Plan for next major release
High Impact + Low Effort = Fix immediately
Low Impact + High Effort = Consider for future
Low Impact + Low Effort = Fix if time permits
```

---

## POST-TEST QUESTIONNAIRE

### System Usability Scale (SUS)
Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree):

1. I think I would like to use this system frequently. ___
2. I found the system unnecessarily complex. ___
3. I thought the system was easy to use. ___
4. I think I would need technical support to use this system. ___
5. I found the various functions in this system well integrated. ___
6. I thought there was too much inconsistency in this system. ___
7. I imagine most people would learn this system quickly. ___
8. I found the system very cumbersome to use. ___
9. I felt very confident using the system. ___
10. I needed to learn a lot before I could get going with this system. ___

**SUS Score Calculation:** ((Sum of odd items - 5) + (25 - sum of even items)) × 2.5 = ___

### Overall Satisfaction
1. How satisfied are you with the overall system? (1-10): ___
2. How likely are you to recommend this system? (1-10): ___
3. What is the most frustrating aspect? _______________
4. What is the most helpful feature? _______________
5. What would you change first? _______________

### Task-Specific Feedback
For each major task completed, rate:
- Ease of completion (1-5): ___
- Time to complete was reasonable (1-5): ___
- Instructions were clear (1-5): ___
- Results met expectations (1-5): ___

---

**Test Completion Checklist:**
- [ ] All heuristic evaluations completed
- [ ] All persona scenarios tested
- [ ] Performance benchmarks recorded
- [ ] Error handling verified
- [ ] Integration points tested
- [ ] Security tests passed
- [ ] Accessibility requirements met
- [ ] Browser compatibility confirmed
- [ ] Post-test questionnaire completed
- [ ] Priority issues documented
- [ ] Recommendations compiled