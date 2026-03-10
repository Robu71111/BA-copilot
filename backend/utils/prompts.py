"""
AI Prompt Templates
===================
Optimized for FREE OpenRouter models (Gemini Flash, DeepSeek, Llama, etc.)
"""


class PromptTemplates:
    """Collection of all AI prompt templates optimized for free models"""
    
    @staticmethod
    def requirements_extractor(raw_text, project_type="General", industry="General"):
        """
        Prompt for extracting requirements from raw text.
        Optimized for free models with clear, strict formatting.
        """
        return f"""You are a Business Analyst expert. Extract requirements from the text below.

PROJECT CONTEXT:
- Type: {project_type}
- Industry: {industry}

DEFINITIONS:
- FUNCTIONAL requirements: WHAT the system must DO — features, behaviours, user actions, data operations.
  Examples: "The system shall allow users to log in", "The system shall process payments via Stripe".
- NON-FUNCTIONAL requirements: HOW the system must PERFORM — performance, security, scalability, reliability, compliance, usability, availability.
  Examples: "The system shall respond within 200ms", "The system shall support 10,000 concurrent users", "The system shall be available 99.9% uptime".

STRICT OUTPUT FORMAT (FOLLOW EXACTLY):

## Functional Requirements

- FR-001: [Complete functional requirement description]
- FR-002: [Complete functional requirement description]
[Continue numbering...]

## Non-Functional Requirements

- NFR-001: [Complete non-functional requirement description]
- NFR-002: [Complete non-functional requirement description]
[Continue numbering...]

CRITICAL RULES — FOLLOW EVERY ONE:
1. NEVER repeat or duplicate the same requirement in both sections. Each requirement appears ONCE only.
2. A requirement is either functional OR non-functional — it cannot be both. Choose the correct section.
3. Non-functional requirements must describe quality attributes (speed, scale, security, reliability), NOT features.
4. Start with "## Functional Requirements", use format "- FR-XXX: description"
5. Then "## Non-Functional Requirements", use format "- NFR-XXX: description"
6. NO intro text, NO outro text, NO commentary
7. Extract 5-15 functional and 3-8 non-functional requirements

INPUT TEXT TO ANALYZE:
{raw_text}

NOW EXTRACT REQUIREMENTS IN THE EXACT FORMAT ABOVE:"""


    @staticmethod
    def user_story_generator(requirements_text, project_type="General"):
        """
        Prompt for generating user stories from requirements.
        Optimized for free models.
        """
        return f"""You are a Scrum Master. Convert requirements into Agile User Stories.

PROJECT TYPE: {project_type}

STRICT OUTPUT FORMAT (FOLLOW EXACTLY):

**Story ID**: US-001
**Title**: [Short title - max 6 words]
**User Story**: As a [role], I want [feature], so that [value]
**Priority**: High
**Story Points**: 3
**Dependencies**: None
**Notes**: [Any notes or None]

---

**Story ID**: US-002
**Title**: [Short title - max 6 words]
**User Story**: As a [role], I want [feature], so that [value]
**Priority**: Medium
**Story Points**: 5
**Dependencies**: US-001
**Notes**: [Any notes or None]

---

[Continue with more stories...]

RULES:
1. Separate each story with exactly "---"
2. Use exact field names as shown
3. Priority must be: High, Medium, or Low
4. Story Points must be: 1, 2, 3, 5, 8, or 13
5. Create 5-10 user stories minimum

REQUIREMENTS TO CONVERT:
{requirements_text}

NOW GENERATE USER STORIES IN THE EXACT FORMAT ABOVE:"""


    @staticmethod
    def acceptance_criteria_generator(user_story_text):
        """
        Prompt for generating acceptance criteria.
        Optimized for free models.
        """
        return f"""You are a QA Engineer. Create Gherkin-style Acceptance Criteria for this user story.

STRICT OUTPUT FORMAT (FOLLOW EXACTLY):

**Scenario 1: Successful Login**
- GIVEN the user is on the login page
- AND has valid credentials
- WHEN the user enters email and password
- AND clicks Login button
- THEN the system authenticates the user
- AND redirects to dashboard

**Scenario 2: Invalid Password**
- GIVEN the user is on the login page
- WHEN the user enters incorrect password
- THEN the system displays error message
- AND the user remains on login page

**Scenario 3: [Another scenario]**
- GIVEN [precondition]
- WHEN [action]
- THEN [result]

RULES:
1. Create 3-5 scenarios
2. Use GIVEN-WHEN-THEN format
3. Use AND for multiple conditions
4. Include happy path and error scenarios
5. Be specific and testable

USER STORY:
{user_story_text}

NOW GENERATE ACCEPTANCE CRITERIA IN THE EXACT FORMAT ABOVE:"""


    @staticmethod
    def summarize_meeting(transcript):
        """
        Prompt for summarizing meeting transcripts.
        """
        return f"""You are a Business Analyst. Summarize this meeting transcript.

OUTPUT FORMAT:

## Meeting Summary
[2-3 sentence overview]

## Key Discussion Points
- [Point 1]
- [Point 2]
- [Point 3]

## Decisions Made
- [Decision 1]
- [Decision 2]

## Action Items
- [Action 1] - Owner: [Name] - Due: [Date]
- [Action 2] - Owner: [Name] - Due: [Date]

## Open Questions
- [Question 1]
- [Question 2]

TRANSCRIPT:
{transcript}

NOW SUMMARIZE IN THE FORMAT ABOVE:"""