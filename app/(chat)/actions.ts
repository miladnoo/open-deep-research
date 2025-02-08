'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { customModel } from '@/lib/ai';
import { VisibilityType } from '@/components/visibility-selector';

export async function saveModelId(model: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('model-id', model, {
      // Set cookie options
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // 30 days
      maxAge: 60 * 60 * 24 * 30
    });
    
    // Revalidate the path to ensure UI updates
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save model ID:', error);
    return { success: false, error: 'Failed to save model preference' };
  }
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  const { text: title } = await generateText({
    model: customModel('gpt-4o'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

// Database operations disabled
export async function deleteTrailingMessages({ id }: { id: string }) {
  console.log('Database operations disabled');
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  console.log('Database operations disabled');
}
