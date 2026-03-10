"""
AI Prompt Templates — v3
Optimized for free OpenRouter models. Strict formatting. Zero duplicates.
"""


class PromptTemplates:

    @staticmethod
    def requirements_extractor(raw_text, project_type="General", industry="General"):
        return f"""You are a senior Business Analyst. Extract structured requirements from the input text.

PROJECT CONTEXT: Type={project_type}, Industry={industry}

DEFINITIONS (memorize these before you start):
- FUNCTIONAL (FR): WHAT the system must DO. Actions, features, behaviours, integrations, data operations.
  Good examples: "The system shall allow users to log in via email", "The system shall integrate with Stripe BNPL API", "The system shall send email notifications on order completion"
- NON-FUNCTIONAL (NFR): HOW WELL the system must perform. Quality attributes ONLY: performance, scalability, security, reliability, availability, compliance, usability, maintainability.
  Good examples: "The system shall respond within 200ms", "The system shall support 99.9% uptime", "The system shall encrypt all user data at rest"
  BAD non-functional: anything describing a feature or action — that belongs in Functional.

STRICT OUTPUT FORMAT — copy this exactly:

## Functional Requirements

- FR-001: [description]
- FR-002: [description]
- FR-003: [description]

## Non-Functional Requirements

- NFR-001: [description]
- NFR-002: [description]

MANDATORY RULES — violating any rule makes your output wrong:
1. NEVER put the same idea in both sections. Every requirement appears EXACTLY ONCE.
2. The FR items must be DIFFERENT from all NFR items — do not reuse the same sentence.
3. NFR items must ONLY describe quality attributes (speed, scale, security, uptime, compliance). If it describes an action or feature, it is FR not NFR.
4. Generate 6-12 functional requirements and 3-6 non-functional requirements.
5. Output ONLY the two sections above. No intro, no summary, no commentary.
6. Each requirement must be a complete sentence starting with "The system shall..."

INPUT TEXT:
{raw_text}

OUTPUT:"""

    @staticmethod
    def user_story_generator(requirements_text, project_type="General"):
        return f"""You are an experienced Scrum Master. Convert the requirements below into Agile User Stories.

PROJECT TYPE: {project_type}

OUTPUT FORMAT — copy exactly, one story per block:

**Story ID**: US-001
**Title**: [Max 6 words]
**User Story**: As a [specific role], I want [specific feature], so that [specific business value]
**Priority**: High
**Story Points**: 3
**Dependencies**: None
**Notes**: [Specific note or None]

---

**Story ID**: US-002
**Title**: [Max 6 words]
**User Story**: As a [specific role], I want [specific feature], so that [specific business value]
**Priority**: Medium
**Story Points**: 5
**Dependencies**: US-001
**Notes**: [Specific note or None]

---

RULES:
1. Separate each story with "---" on its own line
2. Use EXACT field names as shown above
3. Priority: High, Medium, or Low only
4. Story Points: 1, 2, 3, 5, 8, or 13 only
5. Generate one user story per distinct requirement
6. Make each story independent and testable
7. Role must be specific (e.g. "registered customer", "admin user", "QA engineer") not just "user"

REQUIREMENTS:
{requirements_text}

OUTPUT:"""

    @staticmethod
    def acceptance_criteria_generator(user_story_text):
        return f"""You are a senior QA Engineer. Generate Gherkin BDD acceptance criteria for this user story.

OUTPUT FORMAT — copy exactly:

**Scenario 1: [Descriptive scenario name]**
- GIVEN [initial context or precondition]
- AND [additional precondition if needed]
- WHEN [the action taken]
- THEN [expected outcome]
- AND [additional outcome if needed]

**Scenario 2: [Descriptive scenario name]**
- GIVEN [initial context]
- WHEN [the action]
- THEN [expected outcome]

**Scenario 3: [Descriptive scenario name]**
- GIVEN [initial context]
- WHEN [the action]
- THEN [expected outcome]

RULES:
1. Create exactly 3-5 scenarios
2. Scenario 1 = happy path (success case)
3. Scenario 2+ = edge cases, error cases, boundary conditions
4. Every scenario must have at least GIVEN + WHEN + THEN
5. Be specific and testable — avoid vague language
6. Output ONLY the scenarios. No intro text, no summary.

USER STORY:
{user_story_text}

OUTPUT:"""

    @staticmethod
    def summarize_meeting(transcript):
        return f"""You are a Business Analyst. Summarize this meeting transcript.

OUTPUT FORMAT:

## Meeting Summary
[2-3 sentence overview]

## Key Discussion Points
- [Point 1]
- [Point 2]

## Decisions Made
- [Decision 1]

## Action Items
- [Action] - Owner: [Name] - Due: [When]

## Blockers & Risks
- [Blocker or None]

TRANSCRIPT:
{transcript}

OUTPUT:"""