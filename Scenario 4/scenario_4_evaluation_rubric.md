# Scenario 4 Evaluation Rubric

## Scoring Overview

**Total Points: 100**

- **Part A: Core Transformation (30 points)**
- **Part B: Validation (20 points)**
- **Part C: Edge Cases (20 points)**
- **Part D: Testing (20 points)**
- **Part E: Code Quality (10 points)**
- **Bonus: Batch Processing (+10 points)**

---

## Part A: Core Transformation (30 points)

### Field Mapping (10 points)

**Excellent (9-10 points):**
- All fields correctly mapped
- Optional fields handled properly (omitted when missing)
- Nested structures correctly transformed

**Good (7-8 points):**
- Most fields correctly mapped
- Minor issues with optional fields
- Nested structures mostly correct

**Acceptable (5-6 points):**
- Core fields mapped
- Some fields missing or incorrectly mapped
- Some nesting issues

**Needs Work (0-4 points):**
- Multiple mapping errors
- Significant structure issues

### Weight Conversion (10 points)

**Excellent (9-10 points):**
- Correct conversion formula (oz / 16 = lb)
- Handles decimal weights accurately
- Proper rounding/precision

**Good (7-8 points):**
- Mostly correct conversions
- Minor precision issues

**Acceptable (5-6 points):**
- Basic conversion works
- Some accuracy issues

**Needs Work (0-4 points):**
- Incorrect formula or significant errors

### Dimension Parsing (10 points)

**Excellent (9-10 points):**
- Parses various formats ("10x8x6", "10 x 8 x 6")
- Extracts all three values correctly
- Proper number conversion

**Good (7-8 points):**
- Parses standard format
- Minor issues with spacing

**Acceptable (5-6 points):**
- Basic parsing works
- Doesn't handle variations well

**Needs Work (0-4 points):**
- Parsing doesn't work or is incorrect

---

## Part B: Validation (20 points)

### Required Field Validation (8 points)

**Excellent (7-8 points):**
- All required fields validated
- Clear error messages with field names
- Validates nested required fields

**Good (5-6 points):**
- Most required fields validated
- Decent error messages

**Acceptable (3-4 points):**
- Some validation present
- Vague error messages

**Needs Work (0-2 points):**
- Little to no validation

### Data Format Validation (6 points)

**Excellent (5-6 points):**
- Email format validated
- Dimensions format validated
- Numeric type validation

**Good (4 points):**
- Most formats validated
- Minor gaps

**Acceptable (2-3 points):**
- Some format validation

**Needs Work (0-1 points):**
- Little to no format validation

### Business Logic Validation (6 points)

**Excellent (5-6 points):**
- Validates positive quantities
- Validates positive weights/dimensions
- Validates at least one item

**Good (4 points):**
- Most business rules validated

**Acceptable (2-3 points):**
- Some business validation

**Needs Work (0-1 points):**
- Little to no business validation

---

## Part C: Edge Cases (20 points)

### Missing Optional Fields (5 points)

**Excellent (5 points):**
- Handles missing street2 correctly
- Optional fields omitted (not null)

**Good (4 points):**
- Mostly handles optional fields

**Acceptable (2-3 points):**
- Some handling

**Needs Work (0-1 points):**
- Crashes or incorrect handling

### Invalid Data Handling (8 points)

**Excellent (7-8 points):**
- Throws errors for negative values
- Handles malformed dimensions
- Clear error messages

**Good (5-6 points):**
- Most invalid data handled

**Acceptable (3-4 points):**
- Some error handling

**Needs Work (0-2 points):**
- Poor or no error handling

### Special Cases (7 points)

**Excellent (6-7 points):**
- Handles decimal weights
- Handles various dimension formats
- Handles international addresses

**Good (4-5 points):**
- Most special cases handled

**Acceptable (2-3 points):**
- Some special cases handled

**Needs Work (0-1 points):**
- Few special cases handled

---

## Part D: Testing (20 points)

### Test Coverage (8 points)

**Excellent (7-8 points):**
- >90% code coverage
- Tests happy path and errors
- Tests edge cases

**Good (5-6 points):**
- 70-90% coverage
- Good variety of tests

**Acceptable (3-4 points):**
- 50-70% coverage
- Basic tests present

**Needs Work (0-2 points):**
- <50% coverage

### Test Quality (7 points)

**Excellent (6-7 points):**
- Clear test names
- Well-organized
- Appropriate assertions
- AAA pattern followed

**Good (4-5 points):**
- Good test structure
- Minor organization issues

**Acceptable (2-3 points):**
- Tests work but poor structure

**Needs Work (0-1 points):**
- Poorly written tests

### Test Scenarios (5 points)

**Excellent (5 points):**
- Tests success cases
- Tests validation errors (multiple)
- Tests conversions
- Tests edge cases

**Good (4 points):**
- Good variety of scenarios

**Acceptable (2-3 points):**
- Basic scenarios covered

**Needs Work (0-1 points):**
- Few scenarios

---

## Part E: Code Quality (10 points)

### Code Organization (3 points)

**Excellent (3 points):**
- Well-organized functions
- Clear separation of concerns
- Logical structure

**Good (2 points):**
- Decent organization

**Acceptable (1 point):**
- Some organization

**Needs Work (0 points):**
- Poor organization

### Naming & Readability (3 points)

**Excellent (3 points):**
- Descriptive names
- Clear intent
- Easy to read

**Good (2 points):**
- Mostly clear

**Acceptable (1 point):**
- Some clarity issues

**Needs Work (0 points):**
- Confusing code

### Documentation (2 points)

**Excellent (2 points):**
- Comments for complex logic
- README with setup instructions
- Type definitions documented

**Good (1 point):**
- Some documentation

**Needs Work (0 points):**
- Little to no documentation

### Type Safety (2 points)

**Excellent (2 points):**
- Proper TypeScript types
- No 'any' types
- Type safety throughout

**Good (1 point):**
- Mostly type-safe

**Needs Work (0 points):**
- Poor type usage

---

## Bonus: Batch Processing (+10 points)

**Excellent (+10 points):**
- Handles multiple orders
- Collects successes and failures separately
- Doesn't stop on first error
- Good error handling

**Good (+7-9 points):**
- Working batch processing
- Minor issues

**Acceptable (+4-6 points):**
- Basic batch processing works

**Needs Work (+0-3 points):**
- Attempted but incomplete

---

## Overall Grading Scale

**A (90-100+):** Excellent work, production-ready
- All transformations correct
- Comprehensive validation
- All edge cases handled
- Excellent test coverage
- Clean, maintainable code

**B (80-89):** Good work, minor improvements needed
- Core functionality solid
- Good validation
- Most edge cases handled
- Good test coverage
- Clean code

**C (70-79):** Acceptable, needs improvement
- Basic functionality works
- Some validation
- Some edge cases handled
- Basic tests
- Functional code

**D (60-69):** Needs significant work
- Some functionality works
- Limited validation
- Few edge cases handled
- Limited tests
- Code quality issues

**F (<60):** Not meeting requirements
- Major functionality gaps
- Little to no validation
- Poor edge case handling
- Insufficient tests
- Significant code issues

---

## Key Evaluation Criteria

### Must Haves (For Passing Score)
- ✅ Core transformation works for valid input
- ✅ Weight conversion formula correct
- ✅ Dimension parsing works
- ✅ At least basic validation present
- ✅ Some unit tests present
- ✅ Code runs without errors

### Nice to Haves (For Higher Score)
- Comprehensive validation
- All edge cases handled
- Excellent test coverage
- Clean, maintainable code
- Good documentation
- Bonus features implemented

### Red Flags (Lower Score)
- ❌ Incorrect transformations
- ❌ No validation
- ❌ No error handling
- ❌ No tests
- ❌ Code doesn't run
- ❌ Silent failures

---

## Feedback Guidelines

**For Excellent Submissions:**
- Highlight what was done particularly well
- Suggest minor optimizations if any
- Encourage the approach taken

**For Good Submissions:**
- Note strengths
- Identify specific areas for improvement
- Provide examples of how to enhance

**For Needs Work Submissions:**
- Identify critical gaps
- Provide concrete improvement suggestions
- Offer resources or examples

---

## Decision Matrix

| Score | Recommendation |
|-------|---------------|
| 90+ | Strong hire - excellent technical skills |
| 80-89 | Hire - good skills, minor gaps |
| 70-79 | Maybe - needs improvement but potential |
| 60-69 | Likely no - significant gaps |
| <60 | No - does not meet requirements |

**Note:** Score is one factor. Also consider:
- Problem-solving approach
- Code quality beyond correctness
- Communication in README
- Attention to edge cases
- Production readiness mindset
