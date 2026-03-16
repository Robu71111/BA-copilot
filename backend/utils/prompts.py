"""
AI Prompt Templates — v5
========================
Key improvements over v4:
  - CRITICAL FIX: requirements prompt now explicitly forbids duplicates across sections
  - Added dedup verification step before output
  - process_flow_diagram prompt unchanged
"""


class PromptTemplates:

    # ── 1. REQUIREMENTS EXTRACTION ────────────────────────────────────────────
    @staticmethod
    def requirements_extractor(raw_text: str, project_type: str = "General", industry: str = "General") -> str:
        return f"""You are a senior Business Analyst with 15 years experience writing IEEE 830-compliant requirements.

PROJECT CONTEXT: Type={project_type}, Industry={industry}

STEP 1 — UNDERSTAND THE INPUT
Before extracting, silently identify: Who are the actors? What actions/features are described? Any performance or security constraints?

STEP 2 — DEFINITIONS

FUNCTIONAL REQUIREMENT (FR) = WHAT the system must DO — a specific feature, action, or behaviour
  Test: "Can a developer implement this as a specific feature?" Yes = FR
  GOOD FR: The system shall allow users to register using email and password
  GOOD FR: The system shall send an order confirmation email within 30 seconds
  GOOD FR: The system shall calculate tax based on the user's ZIP code
  NOT FR: The system shall respond within 2 seconds (this is PERFORMANCE = NFR)
  NOT FR: The system shall be available 99.9% of the time (this is AVAILABILITY = NFR)
  NOT FR: The system shall encrypt data at rest (this is SECURITY = NFR)
  NOT FR: The system shall support 10,000 users (this is SCALABILITY = NFR)

NON-FUNCTIONAL REQUIREMENT (NFR) = HOW WELL the system performs — quality attributes only
  NFR categories: Performance, Scalability, Security, Reliability, Availability, Compliance, Usability
  Test: "Does this describe a measurable quality attribute, NOT a feature?" Yes = NFR
  GOOD NFR: The system shall respond to API requests within 200ms under normal load
  GOOD NFR: The system shall support 10,000 concurrent users without degradation
  GOOD NFR: The system shall encrypt all PII at rest using AES-256
  NOT NFR: The system shall allow password reset (this is a FEATURE = FR)

STEP 3 — CLASSIFICATION DECISION TREE (apply to EVERY requirement)
  Q1: Does this describe a user-facing feature or action? → FR
  Q2: Does this describe performance, scalability, security, availability, or compliance? → NFR
  Q3: Could this appear in both categories? → Pick the PRIMARY intent. If it describes WHAT to do → FR. If it describes HOW WELL → NFR.

STEP 4 — DEDUPLICATION CHECK
  Before writing output, verify: NO requirement text appears in BOTH the FR and NFR sections. If you find a duplicate, REMOVE it from the wrong section. A requirement about response time is ALWAYS NFR. A requirement about encryption is ALWAYS NFR. A requirement about concurrent users is ALWAYS NFR.

STEP 5 — OUTPUT IN THIS EXACT FORMAT:

## Functional Requirements

- FR-001: The system shall [complete functional requirement]
- FR-002: The system shall [complete functional requirement]

## Non-Functional Requirements

- NFR-001: The system shall [complete quality attribute requirement]
- NFR-002: The system shall [complete quality attribute requirement]

ABSOLUTE RULES:
1. A requirement MUST appear in EXACTLY ONE section — NEVER in both FR and NFR
2. If the same concept could be FR or NFR, classify it ONCE based on primary intent
3. Generate 6-12 FRs and 3-6 NFRs
4. No intro, no summary, no commentary — only the two sections
5. Each requirement must be unique, complete, and testable
6. NFRs must include a measurable qualifier where possible
7. Performance, scalability, security, availability, compliance requirements are ALWAYS NFR — never FR

INPUT TEXT:
{raw_text}

OUTPUT (start immediately with ## Functional Requirements):"""

    # ── 2. USER STORY GENERATION ──────────────────────────────────────────────
    @staticmethod
    def user_story_generator(requirements_text: str, project_type: str = "General") -> str:
        return f"""You are a certified Scrum Master writing backlog items for a {project_type} system.

ROLE TAXONOMY — always use a specific role, NEVER just "user":
  Customer-facing:  "registered customer", "guest visitor", "new user", "returning buyer"
  Administrative:   "system administrator", "support agent", "operations manager"
  Technical:        "developer", "QA engineer", "DevOps engineer"
  Business:         "product manager", "business analyst", "finance team"

STORY POINTS GUIDE:
  1=trivial, 2=simple, 3=medium, 5=complex, 8=very complex, 13=epic (split if possible)

PRIORITY GUIDE:
  High=core/blocking, Medium=important but not blocking, Low=nice-to-have

WORKED EXAMPLE (copy this exact structure):

**Story ID**: US-001
**Title**: Secure Email Login
**User Story**: As a registered customer, I want to log in using my email and password, so that I can access my personalised account dashboard
**Priority**: High
**Story Points**: 3
**Dependencies**: None
**Notes**: Must support "Remember me" functionality

---

**Story ID**: US-002
**Title**: Google OAuth Sign-In
**User Story**: As a new user, I want to sign up using my Google account, so that I can register without creating a separate password
**Priority**: High
**Story Points**: 5
**Dependencies**: US-001
**Notes**: Requires Google OAuth 2.0 integration

---

RULES:
1. One story per distinct requirement — never merge multiple requirements
2. Separate each story with exactly "---" on its own line
3. Use EXACT field names as shown above
4. Title: 2-6 words, title-case
5. User Story: must follow "As a [specific role], I want [feature], so that [value]"
6. Dependencies: use story IDs or "None"
7. Notes: specific implementation detail or "None"

REQUIREMENTS TO CONVERT:
{requirements_text}

OUTPUT (start with **Story ID**: US-001):"""

    # ── 3. ACCEPTANCE CRITERIA ────────────────────────────────────────────────
    @staticmethod
    def acceptance_criteria_generator(user_story_text: str) -> str:
        return f"""You are a senior QA Engineer specialising in BDD and Gherkin syntax.

SCENARIO STRUCTURE:
  GIVEN  = initial state / precondition
  WHEN   = the action the user takes
  THEN   = the expected observable outcome
  AND    = additional condition (chain after GIVEN, WHEN, or THEN)

WORKED EXAMPLE:
User story: As a registered customer, I want to reset my password, so that I can regain access if I forget it

**Scenario 1: Successful password reset**
- GIVEN the user is on the login page and has a registered account
- WHEN the user clicks Forgot Password and submits their email address
- THEN the system sends a password reset email within 60 seconds
- AND the email contains a reset link valid for 24 hours

**Scenario 2: Email address not registered**
- GIVEN the user is on the forgot password page
- WHEN the user submits an email not registered in the system
- THEN the system displays a neutral message without confirming or denying the account exists

**Scenario 3: Expired reset link**
- GIVEN the user received a reset email more than 24 hours ago
- WHEN the user clicks the expired reset link
- THEN the system shows an expiry error
- AND prompts the user to request a new reset link

REQUIRED COVERAGE:
  Scenario 1: Happy path — everything works correctly
  Scenario 2: Input validation or not-found failure
  Scenario 3: Permission, auth, or state error
  Scenario 4 (if applicable): Boundary or concurrent case
  Scenario 5 (if applicable): Recovery / retry flow

QUALITY RULES:
1. Be specific — use concrete values, not placeholders like "[some value]"
2. Every THEN must be observable — something verifiable by a tester
3. Avoid vague language: never write "should work correctly" or "displays properly"
4. Each scenario must be independently executable
5. Output ONLY the scenarios. No intro, no summary.

USER STORY:
{user_story_text}

OUTPUT (start with **Scenario 1:**):"""

    # ── 4. PROCESS FLOW DIAGRAM (NEW) ─────────────────────────────────────────
    @staticmethod
    def process_flow_diagram(stories_text: str, project_name: str = "System") -> str:
        return f"""You are a Business Analyst creating a process flow diagram in Mermaid.js syntax.

Task: Convert the user stories below into a Mermaid flowchart showing the complete end-to-end user journey.

MERMAID SYNTAX:
  flowchart TD           = top-down flow (always use this)
  ([text])               = rounded pill  → START and END nodes only
  [text]                 = rectangle     → process steps
  {{text}}               = diamond       → decision / branch point
  [(text)]               = cylinder      → data store
  A --> B                = arrow (flow)
  A -->|Yes| B           = labelled arrow
  Node IDs: short alphanumeric only — A, B, C or S1, S2, D1

WORKED EXAMPLE:
flowchart TD
    A([Start]) --> B[User visits platform]
    B --> C{{Has account?}}
    C -->|Yes| D[Log in with credentials]
    C -->|No| E[Register new account]
    D --> F[Browse product catalogue]
    E --> F
    F --> G[Select product and add to cart]
    G --> H{{Continue shopping?}}
    H -->|Yes| F
    H -->|No| I[Proceed to checkout]
    I --> J[Enter delivery details]
    J --> K[Select payment method]
    K --> L{{Payment successful?}}
    L -->|Yes| M[Generate order confirmation]
    L -->|No| N[Show payment error]
    N --> K
    M --> O[(Save order to database)]
    O --> P[Send confirmation email]
    P --> Q([End])

RULES:
1. Output ONLY valid Mermaid syntax — no explanation, no markdown fences, no triple backticks
2. Start with exactly: flowchart TD
3. Each major user story = 1-2 process nodes
4. Include at least 2 decision diamonds showing branching
5. Always include ([Start]) and ([End]) nodes
6. Node labels: max 6 words, clear and concise
7. All nodes must be connected — no orphaned nodes
8. Maximum 22 nodes for readability

USER STORIES — Project: {project_name}
{stories_text}

OUTPUT (first line must be: flowchart TD):"""

    # ── 5. MEETING SUMMARY ────────────────────────────────────────────────────
    @staticmethod
    def summarize_meeting(transcript: str) -> str:
        return f"""You are a Business Analyst. Extract all actionable information from this transcript.

OUTPUT FORMAT:

## Meeting Summary
[2-3 sentence overview]

## Key Discussion Points
- [Point 1]
- [Point 2]

## Decisions Made
- [Decision with rationale if stated]

## Action Items
- [Action] — Owner: [Name] — Due: [Date or timeframe]

## Blockers & Risks
- [Blocker or "None identified"]

## Requirements Hints
- [Any requirement implied — useful for BA extraction]

TRANSCRIPT:
{transcript}

OUTPUT:"""