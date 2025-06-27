import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBusinessId } from '../../utils/businessId';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create business ID for this user
    const businessId = await getBusinessId(userId);

    return NextResponse.json({ 
      businessId,
      userId // For debugging/admin purposes
    });

  } catch (error) {
    console.error('Error getting business ID:', error);
    return NextResponse.json(
      { error: 'Failed to get business ID' },
      { status: 500 }
    );
  }
} 