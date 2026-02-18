# Invitation Management System - Product Specification
## Matching Hayhom Feature Set

---

## Hayhom Features Summary (What We're Building)

| Feature | Description |
|---------|-------------|
| Event Management | Create events with title, host, date/time, location, dress code, notes |
| 4 Invitation Modes | RSVP+QR, RSVP-only, QR-only, None |
| Guest Management | Import CSV/Excel, manual add, groups/families |
| Multi-channel Sending | WhatsApp templates, SMS with delivery tracking |
| Guest Portal | Public link, RSVP form, QR code display |
| Gate Scanner | QR validation, check-in, offline support |
| Analytics Dashboard | Stats, filters, CSV/PDF export |
| Package Tiers | Guest limits, feature gates, billing |
| Reminders | Automated 24h reminders, no-response follow-ups |
| Templates/Themes | Design library, custom branding |
| Multi-language | Arabic (RTL) + English (LTR) |
| Admin Panel | User/event/package management, audit logs |

---

# A) Product Specification - User Stories & Acceptance Criteria

## 1. Authentication & Tenancy

### US-AUTH-01: User Registration
**As a** new user  
**I want to** sign up with email/phone  
**So that** I can create and manage my events

**Acceptance Criteria:**
- [ ] User can register with email + password
- [ ] User can register with phone + OTP
- [ ] Email/phone verification required
- [ ] Tenant (organization) created automatically
- [ ] Default "Free" package assigned

### US-AUTH-02: User Login
**As a** registered user  
**I want to** log in securely  
**So that** I can access my dashboard

**Acceptance Criteria:**
- [ ] Login with email/password or phone/OTP
- [ ] JWT tokens with refresh mechanism
- [ ] Session management (logout all devices)
- [ ] Rate limiting on login attempts

### US-AUTH-03: Team Members (Future)
**As an** organizer  
**I want to** invite team members  
**So that** they can help manage events

**Acceptance Criteria:**
- [ ] Invite by email with role assignment
- [ ] Roles: Owner, Admin, Gate Staff
- [ ] Permissions matrix enforced

---

## 2. Event Management

### US-EVT-01: Create Event
**As an** organizer  
**I want to** create a new event  
**So that** I can send invitations

**Acceptance Criteria:**
- [ ] Required: Title, Date, Time
- [ ] Optional: Location (text + map link), Dress code, Notes, Host name(s)
- [ ] Select invitation mode (A/B/C/D)
- [ ] Select template/theme
- [ ] Set language (AR/EN)
- [ ] Event saved as draft initially

### US-EVT-02: Invitation Modes
**As an** organizer  
**I want to** choose how guests interact  
**So that** I control the experience

| Mode | RSVP | Entry Code (QR) | Use Case |
|------|------|-----------------|----------|
| A | ✅ | ✅ | Formal events with check-in |
| B | ✅ | ❌ | Casual events, headcount only |
| C | ❌ | ✅ | VIP events, no RSVP needed |
| D | ❌ | ❌ | Announcement only |

**Acceptance Criteria:**
- [ ] Mode selection during event creation
- [ ] Guest portal adapts to mode
- [ ] QR generated only for modes A/C
- [ ] RSVP form shown only for modes A/B

### US-EVT-03: Edit Event
**As an** organizer  
**I want to** update event details  
**So that** I can fix mistakes or changes

**Acceptance Criteria:**
- [ ] All fields editable before event date
- [ ] Option to notify guests of changes
- [ ] Audit log of changes

### US-EVT-04: Event Status Management
**As an** organizer  
**I want to** control event lifecycle  
**So that** I can manage active/completed events

**Acceptance Criteria:**
- [ ] Statuses: Draft → Active → Completed → Archived
- [ ] Can cancel event (notify guests)
- [ ] Auto-complete after event date + 24h

---

## 3. Guest Management

### US-GST-01: Add Guests Manually
**As an** organizer  
**I want to** add guests one by one  
**So that** I can build my list gradually

**Acceptance Criteria:**
- [ ] Fields: Name (required), Phone (required), Country code, Email, Group/Family, Notes
- [ ] Phone validation with country code
- [ ] Duplicate detection (same phone)
- [ ] Set max companions per guest

### US-GST-02: Import Guests (CSV/Excel)
**As an** organizer  
**I want to** import a guest list  
**So that** I can add many guests quickly

**Acceptance Criteria:**
- [ ] Support CSV and XLSX formats
- [ ] Column mapping UI
- [ ] Validation report (errors, duplicates)
- [ ] Skip or update duplicates option
- [ ] Max 1000 guests per import

### US-GST-03: Guest Groups/Families
**As an** organizer  
**I want to** group guests  
**So that** I can manage families/companies together

**Acceptance Criteria:**
- [ ] Create named groups
- [ ] Assign guests to groups
- [ ] Filter/sort by group
- [ ] Send to specific groups

### US-GST-04: Guest Companions
**As an** organizer  
**I want to** allow guests to bring companions  
**So that** they can attend with family/friends

**Acceptance Criteria:**
- [ ] Set max companions per guest (0-10)
- [ ] Guest adds companion names during RSVP
- [ ] Each companion gets separate QR (optional)
- [ ] Companion count in analytics

---

## 4. Invitation Sending

### US-SND-01: Send via WhatsApp
**As an** organizer  
**I want to** send invitations via WhatsApp  
**So that** guests receive them instantly

**Acceptance Criteria:**
- [ ] Template-based messages (WhatsApp Business API compliant)
- [ ] Variables: {guest_name}, {event_title}, {date}, {time}, {location}, {link}
- [ ] 4 template options per tenant
- [ ] Preview before sending
- [ ] Delivery status tracking
- [ ] Rate limiting (avoid spam flags)

**Compliance Notes:**
- WhatsApp Business API requires pre-approved templates
- 24-hour session window for free-form messages
- Opt-out mechanism required
- Provider: Twilio, MessageBird, or 360dialog

### US-SND-02: Send via SMS
**As an** organizer  
**I want to** send invitations via SMS  
**So that** I reach guests without WhatsApp

**Acceptance Criteria:**
- [ ] Short message with link
- [ ] International number support
- [ ] Delivery status tracking
- [ ] Fallback if WhatsApp fails

### US-SND-03: Delivery Tracking
**As an** organizer  
**I want to** see delivery status  
**So that** I know who received invitations

**Acceptance Criteria:**
- [ ] Statuses: Queued → Sent → Delivered → Failed
- [ ] Timestamp for each status
- [ ] Error reason for failures
- [ ] Retry failed sends

### US-SND-04: Send Test Invitation
**As an** organizer  
**I want to** send a test to myself  
**So that** I can verify before mass sending

**Acceptance Criteria:**
- [ ] "Send test to my phone" button
- [ ] Uses organizer's phone number
- [ ] Clearly marked as TEST

### US-SND-05: Resend Invitation
**As an** organizer  
**I want to** resend to specific guests  
**So that** I can reach those who didn't respond

**Acceptance Criteria:**
- [ ] Resend to individual or filtered list
- [ ] Cooldown period (min 24h between sends)
- [ ] Track resend count

---

## 5. Guest Portal (Public Invitation Page)

### US-PRT-01: View Invitation
**As a** guest  
**I want to** view the invitation  
**So that** I see event details

**Acceptance Criteria:**
- [ ] Beautiful themed landing page
- [ ] Event details: title, host, date/time, location, dress code
- [ ] Countdown timer
- [ ] Map link (opens Google Maps)
- [ ] RTL/LTR based on event language

### US-PRT-02: RSVP Response
**As a** guest  
**I want to** respond to the invitation  
**So that** the host knows if I'm coming

**Acceptance Criteria:**
- [ ] Accept / Decline buttons
- [ ] Add companions (if allowed)
- [ ] Optional message to host
- [ ] Confirmation screen
- [ ] Can change response until event date

### US-PRT-03: Entry Code Display
**As a** guest  
**I want to** see my entry QR code  
**So that** I can check in at the event

**Acceptance Criteria:**
- [ ] QR code displayed after RSVP (modes A/C)
- [ ] Guest name on QR screen
- [ ] Download QR as image
- [ ] Companion QRs if applicable

### US-PRT-04: Security
**As a** system  
**I want to** secure guest links  
**So that** only invited guests access their page

**Acceptance Criteria:**
- [ ] Unique signed token per guest (JWT or UUID + HMAC)
- [ ] Token expires after event + 7 days
- [ ] No enumeration (random IDs)
- [ ] Rate limiting on portal

---

## 6. Gate Scanner / Check-in

### US-GAT-01: Scan QR Code
**As a** gate staff  
**I want to** scan guest QR codes  
**So that** I can validate entry

**Acceptance Criteria:**
- [ ] Camera-based QR scanner
- [ ] Instant validation (< 1 second)
- [ ] Show: Guest name, status, companion count
- [ ] Green = Valid, Red = Invalid/Already checked-in

### US-GAT-02: Manual Check-in
**As a** gate staff  
**I want to** search and check-in manually  
**So that** I handle guests without QR

**Acceptance Criteria:**
- [ ] Search by name or phone
- [ ] Manual check-in button
- [ ] Note field for exceptions

### US-GAT-03: Check-in Status
**As a** gate staff  
**I want to** see who's checked in  
**So that** I know current attendance

**Acceptance Criteria:**
- [ ] Real-time checked-in count
- [ ] List view with check-in times
- [ ] Filter: Checked-in / Not checked-in

### US-GAT-04: Offline Support
**As a** gate staff  
**I want to** scan without internet  
**So that** I work in poor connectivity

**Acceptance Criteria:**
- [ ] Download guest list before event
- [ ] Scan works offline
- [ ] Queue check-ins locally
- [ ] Sync when online
- [ ] Conflict resolution (server wins)

### US-GAT-05: Multiple Gates
**As an** organizer  
**I want to** have multiple scan points  
**So that** I handle large events

**Acceptance Criteria:**
- [ ] Each gate staff has own device
- [ ] Real-time sync between devices
- [ ] Duplicate check-in prevention
- [ ] Gate identifier in logs

---

## 7. Analytics & Reports

### US-ANL-01: Event Dashboard
**As an** organizer  
**I want to** see event statistics  
**So that** I understand my event status

**Acceptance Criteria:**
- [ ] Total guests invited
- [ ] Sent / Delivered / Failed counts
- [ ] Accepted / Declined / No response counts
- [ ] Checked-in count (live during event)
- [ ] Visual charts

### US-ANL-02: Guest Table
**As an** organizer  
**I want to** see detailed guest list  
**So that** I can manage individuals

**Acceptance Criteria:**
- [ ] Columns: Name, Phone, Group, RSVP Status, Send Status, Check-in Status
- [ ] Sort by any column
- [ ] Filter by: Status, Group, Channel, Check-in
- [ ] Search by name/phone
- [ ] Bulk actions (resend, delete)

### US-ANL-03: Export Reports
**As an** organizer  
**I want to** export data  
**So that** I can analyze offline or share

**Acceptance Criteria:**
- [ ] Export formats: CSV, PDF
- [ ] Full guest list export
- [ ] Filtered export
- [ ] Check-in report with timestamps

---

## 8. Packages & Billing

### US-PKG-01: Package Tiers
**As a** user  
**I want to** see available packages  
**So that** I can choose one

| Feature | Free | Basic (99 SAR) | Premium (199 SAR) | Pro (399 SAR) |
|---------|------|----------------|-------------------|---------------|
| Events | 1 | 3 | 10 | Unlimited |
| Guests/Event | 25 | 100 | 500 | Unlimited |
| Templates | Basic | All | All + Premium | All + Custom |
| WhatsApp | ❌ | ✅ | ✅ | ✅ |
| SMS | ❌ | ❌ | ✅ | ✅ |
| Gate Mode | ❌ | ❌ | ✅ | ✅ |
| Analytics Export | ❌ | ❌ | ✅ | ✅ |
| Reminders | ❌ | 1 | 3 | Unlimited |
| Support | Email | Email | Priority | 24/7 |

**Acceptance Criteria:**
- [ ] Package comparison page
- [ ] Clear pricing display
- [ ] Feature limitations enforced in backend
- [ ] Upgrade prompts when hitting limits

### US-PKG-02: Purchase Package
**As a** user  
**I want to** buy a package  
**So that** I unlock features

**Acceptance Criteria:**
- [ ] Mobile: In-app purchase (RevenueCat)
- [ ] Web: Payment gateway (Stripe/Moyasar)
- [ ] Invoice generation
- [ ] Package activation immediate
- [ ] Validity period (30/60/unlimited days)

### US-PKG-03: Usage Enforcement
**As a** system  
**I want to** enforce package limits  
**So that** users upgrade when needed

**Acceptance Criteria:**
- [ ] Hard limit on guest count
- [ ] Hard limit on event count
- [ ] Feature gates checked on every action
- [ ] Graceful error messages with upgrade CTA

---

## 9. Reminders

### US-REM-01: Automatic Reminder
**As an** organizer  
**I want to** send automatic reminders  
**So that** guests don't forget

**Acceptance Criteria:**
- [ ] 24h before event (default)
- [ ] Configurable timing (12h, 24h, 48h, 1 week)
- [ ] Only to accepted guests
- [ ] Enable/disable per event

### US-REM-02: No-Response Follow-up
**As an** organizer  
**I want to** remind non-responders  
**So that** I get more RSVPs

**Acceptance Criteria:**
- [ ] Send to "no response" guests only
- [ ] Configurable timing (3 days, 1 week before)
- [ ] Max 2 follow-ups
- [ ] Different message template

---

## 10. Templates & Themes

### US-TPL-01: Select Template
**As an** organizer  
**I want to** choose a template  
**So that** my invitation looks beautiful

**Acceptance Criteria:**
- [ ] Template library by category
- [ ] Preview with sample data
- [ ] Free vs Premium tags
- [ ] Apply to event

### US-TPL-02: Customize Theme
**As an** organizer  
**I want to** customize colors/fonts  
**So that** it matches my event

**Acceptance Criteria:**
- [ ] Primary/secondary colors
- [ ] Font selection
- [ ] Header image upload
- [ ] Live preview

### US-TPL-03: WhatsApp Message Templates
**As an** organizer  
**I want to** customize my WhatsApp message  
**So that** it sounds personal

**Acceptance Criteria:**
- [ ] 4 template slots
- [ ] Variable placeholders shown
- [ ] Character limit indicator
- [ ] Preview with sample data

---

## 11. Multi-language Support

### US-LNG-01: App Language
**As a** user  
**I want to** switch app language  
**So that** I use it in my preferred language

**Acceptance Criteria:**
- [ ] Arabic (RTL) and English (LTR)
- [ ] Persistent preference
- [ ] All UI strings translated

### US-LNG-02: Event Language
**As an** organizer  
**I want to** set event language  
**So that** guests see it correctly

**Acceptance Criteria:**
- [ ] Language selection per event
- [ ] Guest portal renders in event language
- [ ] RTL/LTR layout switching

---

## 12. Admin Panel

### US-ADM-01: User Management
**As an** admin  
**I want to** manage users  
**So that** I can support and moderate

**Acceptance Criteria:**
- [ ] List all users with search/filter
- [ ] View user details and events
- [ ] Suspend/unsuspend users
- [ ] Change user package

### US-ADM-02: Template Management
**As an** admin  
**I want to** manage templates  
**So that** I can add new designs

**Acceptance Criteria:**
- [ ] CRUD templates
- [ ] Upload assets
- [ ] Set category and tier

### US-ADM-03: Audit Logs
**As an** admin  
**I want to** see activity logs  
**So that** I can troubleshoot and audit

**Acceptance Criteria:**
- [ ] Log: Sends, RSVPs, Check-ins, Login attempts
- [ ] Filter by user, event, action type, date
- [ ] Export logs

---

# B) Database Schema

## Tables & Relations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   tenants    │───┐   │    users     │       │   packages   │
├──────────────┤   │   ├──────────────┤       ├──────────────┤
│ id (PK)      │   └──>│ id (PK)      │       │ id (PK)      │
│ name         │       │ tenant_id(FK)│<──────│ name         │
│ package_id   │───────│ email        │       │ price        │
│ created_at   │       │ phone        │       │ limits (JSON)│
│ settings     │       │ role         │       │ features     │
└──────────────┘       │ created_at   │       └──────────────┘
                       └──────────────┘
                              │
                              │
                              ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  templates   │       │    events    │       │   reminders  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │<──────│ id (PK)      │───────│ id (PK)      │
│ name         │       │ tenant_id(FK)│       │ event_id(FK) │
│ category     │       │ template_id  │       │ type         │
│ theme (JSON) │       │ title        │       │ scheduled_at │
│ is_premium   │       │ host_name    │       │ sent_at      │
│ preview_url  │       │ date         │       │ status       │
└──────────────┘       │ time         │       └──────────────┘
                       │ location     │
                       │ map_url      │
                       │ dress_code   │
                       │ notes        │
                       │ language     │
                       │ mode (A/B/C/D)│
                       │ status       │
                       │ theme (JSON) │
                       │ created_at   │
                       └──────────────┘
                              │
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    guests    │       │ guest_groups │       │   checkins   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ event_id(FK) │       │ event_id(FK) │       │ guest_id(FK) │
│ group_id(FK) │──────>│ name         │       │ gate_id      │
│ name         │       └──────────────┘       │ scanned_by   │
│ phone        │                              │ checked_at   │
│ country_code │                              │ method       │
│ email        │                              └──────────────┘
│ max_companions│
│ token (unique)│
│ rsvp_status  │
│ rsvp_message │
│ rsvp_at      │
│ qr_code      │
│ created_at   │
└──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  companions  │       │    sends     │       │  audit_logs  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ guest_id(FK) │       │ guest_id(FK) │       │ tenant_id(FK)│
│ name         │       │ channel      │       │ user_id(FK)  │
│ qr_code      │       │ status       │       │ action       │
│ checked_in   │       │ provider_id  │       │ entity_type  │
└──────────────┘       │ error_msg    │       │ entity_id    │
                       │ sent_at      │       │ metadata     │
                       │ delivered_at │       │ ip_address   │
                       └──────────────┘       │ created_at   │
                                              └──────────────┘

┌──────────────┐       ┌──────────────┐
│ msg_templates│       │  purchases   │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ tenant_id(FK)│       │ tenant_id(FK)│
│ channel      │       │ package_id   │
│ name         │       │ amount       │
│ content      │       │ currency     │
│ variables    │       │ provider     │
│ is_default   │       │ provider_id  │
└──────────────┘       │ status       │
                       │ created_at   │
                       └──────────────┘
```

## SQL Schema (PostgreSQL Recommended)

```sql
-- Tenants (Organizations)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    package_id VARCHAR(50) NOT NULL DEFAULT 'free',
    package_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    phone_country VARCHAR(5),
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'owner', -- owner, admin, gate_staff
    language VARCHAR(5) DEFAULT 'ar',
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    category VARCHAR(50) NOT NULL, -- wedding, birthday, corporate, etc
    theme JSONB NOT NULL, -- colors, fonts, layout config
    preview_url VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_templates_category ON templates(category);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    host_name VARCHAR(255),
    host_name_secondary VARCHAR(255), -- for weddings: bride name
    
    -- Date/Time
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    
    -- Location
    location_name VARCHAR(255),
    location_address TEXT,
    location_map_url VARCHAR(500),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Details
    dress_code VARCHAR(100),
    notes TEXT,
    language VARCHAR(5) DEFAULT 'ar', -- ar, en
    
    -- Mode: A=RSVP+QR, B=RSVP only, C=QR only, D=None
    invitation_mode CHAR(1) DEFAULT 'A' CHECK (invitation_mode IN ('A', 'B', 'C', 'D')),
    
    -- Theme customization (overrides template)
    custom_theme JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed, cancelled, archived
    published_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);

-- Guest Groups
CREATE TABLE guest_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_guest_groups_event ON guest_groups(event_id);

-- Guests
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    group_id UUID REFERENCES guest_groups(id) ON DELETE SET NULL,
    
    -- Info
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    phone_country VARCHAR(5) DEFAULT '+966',
    email VARCHAR(255),
    notes TEXT,
    
    -- Companions
    max_companions INT DEFAULT 0,
    
    -- Security
    token VARCHAR(64) NOT NULL UNIQUE, -- for invitation link
    qr_code VARCHAR(64) UNIQUE, -- for check-in
    
    -- RSVP
    rsvp_status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    rsvp_message TEXT,
    rsvp_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(event_id, phone)
);
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_guests_token ON guests(token);
CREATE INDEX idx_guests_qr ON guests(qr_code);
CREATE INDEX idx_guests_rsvp ON guests(event_id, rsvp_status);

-- Companions
CREATE TABLE companions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    qr_code VARCHAR(64) UNIQUE,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_companions_guest ON companions(guest_id);

-- Send Records
CREATE TABLE sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    
    channel VARCHAR(20) NOT NULL, -- whatsapp, sms
    template_id UUID, -- message template used
    
    status VARCHAR(20) DEFAULT 'queued', -- queued, sent, delivered, failed
    provider VARCHAR(50), -- twilio, messagebird, etc
    provider_message_id VARCHAR(100),
    error_message TEXT,
    
    queued_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP
);
CREATE INDEX idx_sends_guest ON sends(guest_id);
CREATE INDEX idx_sends_status ON sends(status);

-- Check-ins
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    companion_id UUID REFERENCES companions(id) ON DELETE CASCADE,
    
    gate_id VARCHAR(50), -- identifier for multi-gate events
    scanned_by UUID REFERENCES users(id),
    method VARCHAR(20) DEFAULT 'qr', -- qr, manual
    
    checked_in_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_checkins_guest ON checkins(guest_id);
CREATE INDEX idx_checkins_time ON checkins(checked_in_at);

-- Reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL, -- pre_event, no_response
    hours_before INT, -- hours before event
    target_status VARCHAR(20), -- null=all, 'pending', 'accepted'
    
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, sent, cancelled
    
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reminders_event ON reminders(event_id);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_at, status);

-- Message Templates
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    channel VARCHAR(20) NOT NULL, -- whatsapp, sms
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- [{name, description}]
    
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE, -- system templates can't be deleted
    
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_msg_templates_tenant ON message_templates(tenant_id);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(50) NOT NULL, -- login, send, rsvp, checkin, etc
    entity_type VARCHAR(50), -- event, guest, etc
    entity_id UUID,
    
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Purchases
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    package_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    provider VARCHAR(50) NOT NULL, -- stripe, revenuecat, moyasar
    provider_transaction_id VARCHAR(100),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_purchases_tenant ON purchases(tenant_id);

-- Packages (reference table)
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    limits JSONB NOT NULL, -- {max_events, max_guests_per_event, ...}
    features JSONB NOT NULL, -- {whatsapp, sms, gate_mode, ...}
    
    validity_days INT, -- null = unlimited
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default packages
INSERT INTO packages (id, name, name_ar, price, limits, features, validity_days, sort_order) VALUES
('free', 'Free', 'مجاني', 0, 
    '{"max_events": 1, "max_guests_per_event": 25, "max_reminders": 0}',
    '{"whatsapp": false, "sms": false, "gate_mode": false, "export": false, "premium_templates": false}',
    NULL, 0),
('basic', 'Basic', 'الأساسية', 99,
    '{"max_events": 3, "max_guests_per_event": 100, "max_reminders": 1}',
    '{"whatsapp": true, "sms": false, "gate_mode": false, "export": false, "premium_templates": false}',
    30, 1),
('premium', 'Premium', 'بريميوم', 199,
    '{"max_events": 10, "max_guests_per_event": 500, "max_reminders": 3}',
    '{"whatsapp": true, "sms": true, "gate_mode": true, "export": true, "premium_templates": true}',
    60, 2),
('professional', 'Professional', 'الاحترافية', 399,
    '{"max_events": -1, "max_guests_per_event": -1, "max_reminders": -1}',
    '{"whatsapp": true, "sms": true, "gate_mode": true, "export": true, "premium_templates": true, "custom_branding": true}',
    NULL, 3);
```

---

# C) API Design (tRPC Procedures)

## Router Structure

```
backend/
├── trpc/
│   ├── app-router.ts              # Main router combining all
│   ├── context.ts                 # Request context (user, tenant)
│   ├── middleware.ts              # Auth, rate limiting
│   │
│   ├── auth/
│   │   ├── register.ts            # signup
│   │   ├── login.ts               # login (email/phone)
│   │   ├── verify.ts              # verify OTP
│   │   ├── refresh.ts             # refresh token
│   │   └── logout.ts              # logout
│   │
│   ├── events/
│   │   ├── create.ts              # create event
│   │   ├── get.ts                 # get single event
│   │   ├── list.ts                # list tenant events
│   │   ├── update.ts              # update event
│   │   ├── delete.ts              # delete event
│   │   ├── publish.ts             # publish event (draft → active)
│   │   └── stats.ts               # event statistics
│   │
│   ├── guests/
│   │   ├── create.ts              # add single guest
│   │   ├── import.ts              # bulk import CSV
│   │   ├── list.ts                # list guests (with filters)
│   │   ├── update.ts              # update guest
│   │   ├── delete.ts              # delete guest
│   │   └── groups/
│   │       ├── create.ts
│   │       ├── list.ts
│   │       └── delete.ts
│   │
│   ├── sending/
│   │   ├── send.ts                # send to guests
│   │   ├── send-test.ts           # send test to self
│   │   ├── resend.ts              # resend to guest
│   │   └── status.ts              # get send statuses
│   │
│   ├── portal/                    # Public (no auth)
│   │   ├── invitation.ts          # get invitation by token
│   │   ├── rsvp.ts                # submit RSVP
│   │   └── qr.ts                  # get QR code
│   │
│   ├── gate/
│   │   ├── validate.ts            # validate QR
│   │   ├── checkin.ts             # check in guest
│   │   ├── list.ts                # list guests for gate
│   │   └── sync.ts                # offline sync
│   │
│   ├── analytics/
│   │   ├── dashboard.ts           # dashboard stats
│   │   ├── export.ts              # export CSV/PDF
│   │   └── audit.ts               # audit logs
│   │
│   ├── templates/
│   │   ├── list.ts                # list templates
│   │   └── messages/
│   │       ├── list.ts            # list message templates
│   │       ├── create.ts
│   │       └── update.ts
│   │
│   ├── packages/
│   │   ├── list.ts                # list packages
│   │   └── purchase.ts            # initiate purchase
│   │
│   └── admin/                     # Admin only
│       ├── users/
│       ├── templates/
│       └── logs/
```

## Key Endpoints

### Auth
```typescript
// auth.register
input: { email?: string, phone?: string, password: string, name: string }
output: { userId: string, verificationSent: boolean }

// auth.login
input: { email?: string, phone?: string, password: string }
output: { accessToken: string, refreshToken: string, user: User }

// auth.verifyOtp
input: { phone: string, otp: string }
output: { accessToken: string, refreshToken: string, user: User }
```

### Events
```typescript
// events.create
input: {
  title: string
  hostName: string
  hostNameSecondary?: string
  eventDate: string // ISO date
  eventTime: string // HH:mm
  locationName?: string
  locationAddress?: string
  locationMapUrl?: string
  dressCode?: string
  notes?: string
  language: 'ar' | 'en'
  invitationMode: 'A' | 'B' | 'C' | 'D'
  templateId?: string
  customTheme?: object
}
output: { event: Event }

// events.list
input: { status?: string, page?: number, limit?: number }
output: { events: Event[], total: number }

// events.stats
input: { eventId: string }
output: {
  totalGuests: number
  sent: number
  delivered: number
  failed: number
  accepted: number
  declined: number
  pending: number
  checkedIn: number
}
```

### Guests
```typescript
// guests.create
input: {
  eventId: string
  name: string
  phone: string
  phoneCountry?: string
  email?: string
  groupId?: string
  maxCompanions?: number
  notes?: string
}
output: { guest: Guest }

// guests.import
input: {
  eventId: string
  data: Array<{ name, phone, email?, group?, maxCompanions? }>
}
output: { imported: number, skipped: number, errors: string[] }

// guests.list
input: {
  eventId: string
  status?: 'pending' | 'accepted' | 'declined'
  sendStatus?: 'queued' | 'sent' | 'delivered' | 'failed'
  checkedIn?: boolean
  groupId?: string
  search?: string
  page?: number
  limit?: number
}
output: { guests: Guest[], total: number }
```

### Sending
```typescript
// sending.send
input: {
  eventId: string
  guestIds?: string[] // if empty, send to all unsent
  channel: 'whatsapp' | 'sms'
  templateId?: string
}
output: { queued: number, skipped: number }

// sending.sendTest
input: { eventId: string, channel: 'whatsapp' | 'sms' }
output: { sent: boolean }
```

### Portal (Public)
```typescript
// portal.invitation
input: { token: string }
output: {
  event: {
    title, hostName, date, time, location, dressCode, notes, language, mode
    theme: { colors, fonts, headerImage }
  }
  guest: { name, rsvpStatus, companions: Companion[] }
  canRsvp: boolean
  showQr: boolean
}

// portal.rsvp
input: {
  token: string
  status: 'accepted' | 'declined'
  message?: string
  companions?: string[] // names
}
output: { success: boolean, qrCode?: string }
```

### Gate
```typescript
// gate.validate
input: { eventId: string, qrCode: string }
output: {
  valid: boolean
  guest?: { id, name, companionCount }
  alreadyCheckedIn: boolean
  checkedInAt?: string
}

// gate.checkin
input: { eventId: string, qrCode: string, gateId?: string }
output: { success: boolean, guest: Guest }

// gate.list
input: { eventId: string }
output: { guests: GateGuest[] } // for offline caching
```

---

# D) Key Flows - Sequence Diagrams

## Flow 1: Create & Send Invitations

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Organizer│     │   App   │     │ Backend │     │   DB    │     │WhatsApp │
│         │     │         │     │         │     │         │     │ Provider│
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Create Event  │               │               │               │
     │──────────────>│               │               │               │
     │               │ POST /events  │               │               │
     │               │──────────────>│               │               │
     │               │               │ Check limits  │               │
     │               │               │──────────────>│               │
     │               │               │<──────────────│               │
     │               │               │ Insert event  │               │
     │               │               │──────────────>│               │
     │               │               │<──────────────│               │
     │               │<──────────────│               │               │
     │<──────────────│ Event created │               │               │
     │               │               │               │               │
     │ Add Guests    │               │               │               │
     │──────────────>│               │               │               │
     │               │ POST /guests  │               │               │
     │               │──────────────>│               │               │
     │               │               │ Generate tokens│              │
     │               │               │ Insert guests │               │
     │               │               │──────────────>│               │
     │               │<──────────────│               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ Send Invitations              │               │               │
     │──────────────>│               │               │               │
     │               │ POST /send    │               │               │
     │               │──────────────>│               │               │
     │               │               │ Queue jobs    │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │ For each guest│               │
     │               │               │─────────────────────────────>│
     │               │               │               │  Send message │
     │               │               │<─────────────────────────────│
     │               │               │ Update status │               │
     │               │               │──────────────>│               │
     │               │<──────────────│               │               │
     │<──────────────│ Sending started               │               │
     │               │               │               │               │
```

## Flow 2: Guest RSVP

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Guest  │     │WhatsApp │     │ Portal  │     │ Backend │
│         │     │         │     │  (Web)  │     │         │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Receives msg  │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ Clicks link   │               │               │
     │───────────────────────────────>               │
     │               │               │               │
     │               │               │ GET /invitation?token=xxx
     │               │               │──────────────>│
     │               │               │               │ Validate token
     │               │               │               │ Get event + guest
     │               │               │<──────────────│
     │               │               │               │
     │ Sees invitation page         │               │
     │<──────────────────────────────│               │
     │               │               │               │
     │ Clicks Accept │               │               │
     │───────────────────────────────>               │
     │               │               │               │
     │ Adds companions (if allowed) │               │
     │───────────────────────────────>               │
     │               │               │               │
     │ Submit RSVP   │               │               │
     │───────────────────────────────>               │
     │               │               │ POST /rsvp    │
     │               │               │──────────────>│
     │               │               │               │ Update guest
     │               │               │               │ Generate QR
     │               │               │               │ Log audit
     │               │               │<──────────────│
     │               │               │               │
     │ Sees QR code  │               │               │
     │<──────────────────────────────│               │
     │               │               │               │
```

## Flow 3: Gate Check-in

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Guest  │     │Gate App │     │ Backend │     │   DB    │
│         │     │(Scanner)│     │         │     │         │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Shows QR      │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Scan QR code  │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │ POST /gate/validate           │
     │               │──────────────>│               │
     │               │               │ Lookup guest  │
     │               │               │──────────────>│
     │               │               │<──────────────│
     │               │               │ Check status  │
     │               │<──────────────│               │
     │               │               │               │
     │               │ ┌─────────────────────────┐   │
     │               │ │ Display:                │   │
     │               │ │ ✓ Guest Name            │   │
     │               │ │ ✓ Status: Valid         │   │
     │               │ │ ✓ +2 Companions         │   │
     │               │ └─────────────────────────┘   │
     │               │               │               │
     │               │ Confirm check-in              │
     │               │──────────────>│               │
     │               │               │ Insert checkin│
     │               │               │──────────────>│
     │               │               │<──────────────│
     │               │               │ Broadcast to  │
     │               │               │ other gates   │
     │               │<──────────────│               │
     │               │               │               │
     │ Entry allowed │               │               │
     │<──────────────│               │               │
     │               │               │               │
```

---

# E) Build Plan - Milestones

## Phase 1: MVP (4-6 weeks)
**Goal:** Basic invitation flow working end-to-end

### Week 1-2: Foundation
- [ ] Set up backend (Hono + tRPC + PostgreSQL)
- [ ] Database schema + migrations
- [ ] Basic auth (email/password)
- [ ] User & tenant creation

### Week 3-4: Core Event Flow
- [ ] Create/edit/list events
- [ ] Add guests (manual only)
- [ ] Guest list view with basic filters
- [ ] Invitation link generation (token-based)

### Week 5: Guest Portal
- [ ] Public invitation page (single theme)
- [ ] RSVP submission (accept/decline)
- [ ] QR code generation
- [ ] Basic confirmation screen

### Week 6: Organizer Dashboard
- [ ] Event dashboard with stats
- [ ] Guest table with RSVP status
- [ ] Mobile-responsive design
- [ ] Arabic + English support

**MVP Deliverable:** Organizer can create event, add guests, share links, guests can RSVP

---

## Phase 2: v1.0 (4 weeks)
**Goal:** WhatsApp sending + Gate scanner + Packages

### Week 7-8: Sending
- [ ] WhatsApp integration (Twilio/360dialog)
- [ ] Message template system
- [ ] Send to individual/all guests
- [ ] Delivery status tracking
- [ ] Send history view

### Week 9: Gate Scanner
- [ ] QR scanner screen (camera)
- [ ] Validate & check-in flow
- [ ] Check-in list view
- [ ] Basic offline caching

### Week 10: Packages
- [ ] Package tiers definition
- [ ] Limit enforcement
- [ ] Payment integration (Moyasar/Stripe)
- [ ] Upgrade flow

**v1.0 Deliverable:** Full invitation flow with sending, check-in, and monetization

---

## Phase 3: v1.5 (4 weeks)
**Goal:** Polish + Advanced features

### Week 11-12: Guest Management
- [ ] CSV/Excel import
- [ ] Guest groups/families
- [ ] Companion management
- [ ] Bulk actions

### Week 13: Analytics & Export
- [ ] Enhanced dashboard charts
- [ ] Detailed guest table filters
- [ ] CSV/PDF export
- [ ] Event comparison

### Week 14: Reminders & Templates
- [ ] Automatic reminders (scheduler)
- [ ] Template library (5+ designs)
- [ ] Theme customization
- [ ] Custom message templates

**v1.5 Deliverable:** Production-ready with advanced features

---

## Phase 4: v2.0 (Future)
- SMS integration
- Multi-gate support
- Team members & roles
- Admin panel
- White-label / custom branding
- Advanced analytics
- API for integrations

---

# F) Non-Functional Requirements

## Security

### Authentication & Authorization
- JWT tokens with short expiry (15 min access, 7 day refresh)
- Secure password hashing (bcrypt, cost 12)
- Rate limiting: 5 login attempts per 15 min
- Session invalidation on password change
- Role-based access control (RBAC)

### Data Protection
- All data encrypted at rest (AES-256)
- TLS 1.3 for all connections
- PII encryption for phone numbers
- GDPR-compliant data handling
- Data retention policy (delete after 1 year inactive)

### Invitation Security
- Guest tokens: 64-char random + HMAC signature
- Token validation on every request
- No sequential/guessable IDs
- Rate limit: 10 RSVP attempts per hour per IP
- QR codes: One-time use tokens

### API Security
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CSRF tokens for state-changing operations
- Request size limits (1MB max)

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 | 15 min |
| Register | 3 | 1 hour |
| Send invitation | 100 | 1 hour |
| RSVP submit | 10 | 1 hour |
| API general | 1000 | 1 hour |
| Gate scan | 60 | 1 min |

## Logging & Monitoring

### Application Logs
- Structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- Sensitive data masking

### Audit Logs
- All sends (who, when, channel, status)
- All RSVPs (guest, action, timestamp)
- All check-ins (guest, gate, staff, time)
- All logins (user, IP, success/fail)
- All admin actions

### Metrics
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Send success/failure rates
- Active users (DAU/MAU)
- Queue depth and processing time

## Privacy & Compliance

### Data Handling
- Minimal data collection
- Clear privacy policy
- User consent for communications
- Right to deletion (GDPR Article 17)
- Data portability (GDPR Article 20)

### WhatsApp Compliance
- Use only approved message templates
- Include opt-out mechanism
- Respect 24-hour session window
- No promotional content in transactional messages
- Store consent records

### SMS Compliance
- Include sender identification
- Opt-out instructions
- Comply with local regulations (CITC for Saudi)

## Performance

### Response Times
- API: < 200ms p95
- Portal page load: < 2s
- QR scan validation: < 500ms
- Dashboard: < 1s

### Scalability
- Horizontal scaling for API servers
- Read replicas for database
- CDN for static assets
- Queue-based message sending

### Availability
- 99.9% uptime SLA
- Graceful degradation
- Circuit breakers for external services
- Health check endpoints

---

# Appendix: Technology Recommendations

## Database
**Recommendation: PostgreSQL**
- Multi-tenant safe with Row-Level Security
- JSONB for flexible schema (themes, settings)
- Full-text search for guest lookup
- Proven at scale

## Message Queue
**Recommendation: BullMQ (Redis-backed)**
- For WhatsApp/SMS sending
- Retry with exponential backoff
- Priority queues for reminders
- Dead letter queue for failures

## File Storage
**Recommendation: R2 (Cloudflare) or S3**
- CSV imports
- Export files (CSV/PDF)
- Template assets

## WhatsApp Provider
**Options (ranked):**
1. **360dialog** - Best for MENA region, good pricing
2. **Twilio** - Reliable, global coverage, more expensive
3. **MessageBird** - Good alternative

## SMS Provider
**Options:**
1. **Unifonic** - Saudi-focused, local numbers
2. **Twilio** - International coverage
3. **Nexmo** - Good rates

## Payment
**Options:**
1. **Moyasar** - Saudi-focused, mada support
2. **Stripe** - International, RevenueCat integration
3. **Tap Payments** - MENA region

---

This specification provides a complete roadmap to build a Hayhom-equivalent system. Start with Phase 1 MVP to validate the core flow, then iterate based on user feedback.
