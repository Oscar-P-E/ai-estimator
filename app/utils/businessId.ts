import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

interface BusinessIdMapping {
  [clerkUserId: string]: string;
}

const MAPPING_FILE = path.join(process.cwd(), 'business_files', 'business-id-mapping.json');

// Generate a unique, URL-friendly business ID
function generateBusinessId(): string {
  const randomPart = randomBytes(8).toString('hex');
  const timestamp = Date.now().toString(36);
  return `biz_${timestamp}_${randomPart}`;
}

// Ensure the business_files directory exists
async function ensureDirectory() {
  try {
    await mkdir(path.dirname(MAPPING_FILE), { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }
}

// Load existing mappings
async function loadMappings(): Promise<BusinessIdMapping> {
  try {
    const data = await readFile(MAPPING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet, return empty mapping
    return {};
  }
}

// Save mappings to file
async function saveMappings(mappings: BusinessIdMapping): Promise<void> {
  await ensureDirectory();
  await writeFile(MAPPING_FILE, JSON.stringify(mappings, null, 2));
}

// Get or create business ID for a Clerk user ID
export async function getBusinessId(clerkUserId: string): Promise<string> {
  const mappings = await loadMappings();
  
  if (mappings[clerkUserId]) {
    return mappings[clerkUserId];
  }
  
  // Generate new business ID
  const businessId = generateBusinessId();
  mappings[clerkUserId] = businessId;
  await saveMappings(mappings);
  
  return businessId;
}

// Get Clerk user ID from business ID (reverse lookup)
export async function getClerkUserId(businessId: string): Promise<string | null> {
  const mappings = await loadMappings();
  
  for (const [clerkUserId, mappedBusinessId] of Object.entries(mappings)) {
    if (mappedBusinessId === businessId) {
      return clerkUserId;
    }
  }
  
  return null;
}

// Get all business IDs for debugging/admin purposes
export async function getAllBusinessIds(): Promise<BusinessIdMapping> {
  return await loadMappings();
} 