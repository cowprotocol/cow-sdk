# JSON Schema Validation Report

## Summary

Found **11 critical issues** in JSON schema files:
- **9 issues** where the `$id` field or `default` version field does not match the filename
- **2 typos** in property IDs within the utm schema

## Critical Issues

### 1. v0.8.0.json
- **File**: `src/schemas/v0.8.0.json`
- **Issue**: `$id` field references wrong version
- **Current**: `"$id": "https://cowswap.exchange/schemas/app-data/v0.7.0.json"`
- **Should be**: `"$id": "https://cowswap.exchange/schemas/app-data/v0.8.0.json"`
- **Line**: 2

### 2. v0.9.0.json
- **File**: `src/schemas/v0.9.0.json`
- **Issue**: `$id` field references wrong version
- **Current**: `"$id": "https://cowswap.exchange/schemas/app-data/v0.7.0.json"`
- **Should be**: `"$id": "https://cowswap.exchange/schemas/app-data/v0.9.0.json"`
- **Line**: 2

### 3. v1.0.0.json
- **File**: `src/schemas/v1.0.0.json`
- **Issue 1**: `$id` field references wrong version
  - **Current**: `"$id": "https://cowswap.exchange/schemas/app-data/v0.11.0.json"`
  - **Should be**: `"$id": "https://cowswap.exchange/schemas/app-data/v1.0.0.json"`
  - **Line**: 2
- **Issue 2**: `default` version is wrong
  - **Current**: `"default": "0.11.0"`
  - **Should be**: `"default": "1.0.0"`
  - **Line**: 13

### 4. v1.1.0.json
- **File**: `src/schemas/v1.1.0.json`
- **Issue**: `default` version is wrong
- **Current**: `"default": "0.11.0"`
- **Should be**: `"default": "1.1.0"`
- **Line**: (version.default field)

### 5. orderClass/v0.2.0.json
- **File**: `src/schemas/orderClass/v0.2.0.json`
- **Issue 1**: `$id` field references wrong version
  - **Current**: `"$id": "#orderClass/v0.1.0.json"`
  - **Should be**: `"$id": "#orderClass/v0.2.0.json"`
  - **Line**: 2
- **Issue 2**: `default` version is wrong
  - **Current**: `"default": "0.1.0"`
  - **Should be**: `"default": "0.2.0"`
  - **Line**: 14

### 6. orderClass/v0.3.0.json
- **File**: `src/schemas/orderClass/v0.3.0.json`
- **Issue**: `$id` field references wrong version
- **Current**: `"$id": "#orderClass/v0.1.0.json"`
- **Should be**: `"$id": "#orderClass/v0.3.0.json"`
- **Line**: 2

### 7. referrer/v0.2.0.json
- **File**: `src/schemas/referrer/v0.2.0.json`
- **Issue**: `$id` field references wrong version
- **Current**: `"$id": "#referrer/v0.1.0.json"`
- **Should be**: `"$id": "#referrer/v0.2.0.json"`
- **Line**: 2

### 8. utm/v0.2.0.json
- **File**: `src/schemas/utm/v0.2.0.json`
- **Issue**: `$id` field references wrong version
- **Current**: `"$id": "#utm/v0.1.0.json"`
- **Should be**: `"$id": "#utm/v0.2.0.json"`
- **Line**: 2

### 9. hooks/v0.2.0.json
- **File**: `src/schemas/hooks/v0.2.0.json`
- **Issue**: `default` version is wrong
- **Current**: `"default": "0.1.0"`
- **Should be**: `"default": "0.2.0"`
- **Line**: (version.default field)

## Impact

These mismatches can cause:
1. **Schema validation failures** - AJV cannot properly resolve references when IDs don't match
2. **Version confusion** - Consumers of the schema may receive incorrect version information
3. **Duplicate ID errors** - Multiple schemas claiming the same ID (e.g., v0.8.0, v0.9.0 both using v0.7.0)
4. **Build/compilation issues** - The schema compilation process may fail or produce incorrect TypeScript types

### 10. utm/v0.2.0.json - Typo in utmCampaign property ID
- **File**: `src/schemas/utm/v0.2.0.json`
- **Issue**: Property ID has typo
- **Current**: `"$id": "#/properties/utmCampagin"`
- **Should be**: `"$id": "#/properties/utmCampaign"`
- **Line**: 28
- **Impact**: Property name is correct (`utmCampaign`) but the ID reference has a typo

### 11. utm/v0.2.0.json - Typo in utmTerm property ID
- **File**: `src/schemas/utm/v0.2.0.json`
- **Issue**: Property ID has typo
- **Current**: `"$id": "#/properties/utmTem"`
- **Should be**: `"$id": "#/properties/utmTerm"`
- **Line**: 46
- **Impact**: Property name is correct (`utmTerm`) but the ID reference has a typo

## Impact

These mismatches can cause:
1. **Schema validation failures** - AJV cannot properly resolve references when IDs don't match
2. **Version confusion** - Consumers of the schema may receive incorrect version information
3. **Duplicate ID errors** - Multiple schemas claiming the same ID (e.g., v0.8.0, v0.9.0 both using v0.7.0)
4. **Build/compilation issues** - The schema compilation process may fail or produce incorrect TypeScript types
5. **Reference resolution issues** - Typos in property IDs may cause issues when these properties are referenced elsewhere

## Recommendation

All 11 issues should be corrected:
- 9 files need version corrections in `$id` and/or `default` fields
- 2 typos need to be fixed in utm schema property IDs
