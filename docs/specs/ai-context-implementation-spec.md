# AI Context System Implementation Specification

## Overview
Implementation plan for the simplified AI context system that sends business files directly to Claude for interpretation, eliminating the need for pre-processing or text conversion.

## Architecture Philosophy
**Direct File Upload Approach:**
```
Business File → Store Raw → Send to Claude → AI Interprets Directly
```

Instead of the complex approach:
```
Business File → Process → Extract Schema → Convert to JSON → Send to Claude
```

## Technical Implementation

### 1. File Storage Structure
```
business_files/
  {business_id}/
    pricing.xlsx
    services.csv
    rates.pdf
    catalog.docx
```

### 2. Core Services

#### FileContextService (`/app/services/file-context/file-context.ts`)
```typescript
interface BusinessFile {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export class FileContextService {
  async getBusinessFiles(businessId: string): Promise<BusinessFile[]>
  async sendFilesToClaude(files: BusinessFile[], userMessage: string): Promise<string>
}
```

#### Modified Chat API (`/app/api/chat/route.ts`)
```typescript
// Replace getBusinessPricingData() with:
async function getBusinessFileContext(businessId: string): Promise<BusinessFile[]>

// Update Claude API call to include files:
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: userMessage },
        ...businessFiles.map(file => ({
          type: 'document',
          source: {
            type: 'base64',
            media_type: file.mimeType,
            data: file.buffer.toString('base64')
          }
        }))
      ]
    }
  ]
});
```

#### Simplified Upload API (`/app/api/upload-pricing-doc/route.ts`)
```typescript
// Change storage path from uploads/{userId} to business_files/{businessId}
// Remove all processing logic
// Store files raw without any modification
```

### 3. Implementation Steps

#### Step 1: Create FileContextService
- [ ] Create `/app/services/file-context/file-context.ts`
- [ ] Implement business file reading (raw buffers)
- [ ] Add MIME type detection
- [ ] Implement business ID isolation

#### Step 2: Update Upload API
- [ ] Change storage path to use business ID instead of user ID
- [ ] Remove ExcelProcessor dependency
- [ ] Store files without any processing
- [ ] Add support for multiple file types

#### Step 3: Modify Chat API
- [ ] Replace `getBusinessPricingData()` with `getBusinessFileContext()`
- [ ] Update Claude API call to include file attachments
- [ ] Remove JSON preprocessing logic
- [ ] Update system prompt for file interpretation

#### Step 4: Remove Legacy Code
- [ ] Remove or simplify `excel-processor.ts`
- [ ] Remove PricingData interfaces
- [ ] Clean up unused processing logic

### 4. File Format Support

**Supported by Claude directly:**
- Excel (.xlsx, .xls)
- CSV (.csv)
- PDF (.pdf)
- Word (.docx, .doc)
- Text files (.txt, .md)
- Images (for visual pricing charts)

**No conversion needed** - Claude handles all format interpretation.

### 5. Error Handling

#### File Reading Errors
```typescript
try {
  const files = await getBusinessFiles(businessId);
} catch (error) {
  // Log error, continue with empty context
  console.error('Failed to load business files:', error);
  return [];
}
```

#### Claude API Errors
```typescript
try {
  const response = await anthropic.messages.create({...});
} catch (error) {
  if (error.code === 'file_too_large') {
    // Fallback: send message without files
    return generateResponseWithoutFiles(userMessage);
  }
  throw error;
}
```

#### Business Isolation
```typescript
// Validate business ID to prevent path traversal
function validateBusinessId(businessId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(businessId);
}
```

### 6. Configuration

#### Environment Variables
No new environment variables needed - uses existing `ANTHROPIC_API_KEY`.

#### File Size Limits
- Individual file: 20MB (Claude limit)
- Total context: Monitor token usage
- Implement file prioritization if needed

### 7. Testing Strategy

#### Unit Tests
- [ ] FileContextService file reading
- [ ] Business ID validation
- [ ] MIME type detection
- [ ] Error handling for corrupted files

#### Integration Tests
- [ ] End-to-end: Upload → Chat with context
- [ ] Multiple file formats in single business
- [ ] Business isolation verification
- [ ] Claude API integration with files

#### Manual Testing
- [ ] Upload Excel file → AI references data in chat
- [ ] Upload PDF → AI reads and quotes from content
- [ ] Multiple files → AI combines information
- [ ] Cross-business isolation test

### 8. Performance Considerations

#### File Loading
- Load files on-demand (per chat request)
- Cache file list per business ID
- Monitor memory usage for large files

#### Claude API Efficiency
- Send only relevant files (future optimization)
- Monitor token usage and costs
- Implement file selection logic if needed

### 9. Migration Plan

#### From Current System
1. Deploy new file context service alongside existing
2. Update upload API to store in new location
3. Update chat API to use new context system
4. Remove legacy processing code
5. Migrate existing files to new structure

#### Backwards Compatibility
- Keep existing processed data as fallback during migration
- Gradual rollout per business ID

### 10. Success Criteria

- [ ] ✅ Admin uploads any supported file format
- [ ] ✅ Files stored raw without processing
- [ ] ✅ AI chat includes file content as context
- [ ] ✅ AI can interpret and quote from files directly
- [ ] ✅ Business file isolation working
- [ ] ✅ Multiple file formats supported
- [ ] ✅ Legacy processing code removed
- [ ] ✅ System significantly simplified

## Benefits of This Approach

1. **Simplified Architecture** - No complex file processing
2. **Format Agnostic** - Supports any format Claude supports
3. **Better Accuracy** - AI sees original formatting and structure
4. **Future Proof** - Automatically supports new Claude features
5. **Reduced Dependencies** - No need for format-specific parsers
6. **Faster Development** - Less code to write and maintain
7. **More Robust** - Claude handles edge cases in file formats

## Dependencies

**New Dependencies:** None required
**Removed Dependencies:** Can remove pdf-parse, mammoth (if we add them)
**Existing Dependencies:** xlsx (can be removed after migration) 