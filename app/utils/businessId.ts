import { createHash } from 'crypto';

// Generate a deterministic, URL-friendly business ID from Clerk user ID
function generateBusinessId(clerkUserId: string): string {
  // Create a deterministic hash from the Clerk user ID
  const hash = createHash('sha256').update(clerkUserId).digest('hex');
  
  // Take first 8 characters and last 8 characters for a shorter, readable ID
  const shortHash = hash.substring(0, 8) + hash.substring(-8);
  
  return `biz_${shortHash}`;
}

// Get business ID for a Clerk user ID (deterministic, no storage needed)
export async function getBusinessId(clerkUserId: string): Promise<string> {
  return generateBusinessId(clerkUserId);
}

// Get Clerk user ID from business ID (reverse lookup)
export async function getClerkUserId(businessId: string): Promise<string | null> {
  // Since this is deterministic, we can't reverse it without the original Clerk ID
  // This would require a database lookup in a real implementation
  // For now, return null as this function isn't currently used
  return null;
}

// Get all business IDs for debugging/admin purposes
export async function getAllBusinessIds(): Promise<{[clerkUserId: string]: string}> {
  // This would require a database in a real implementation
  // For now, return empty object
  return {};
} 