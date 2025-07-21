import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename to avoid collisions
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `${session.userId}-${Date.now()}.${fileExtension}`;
  
  const relativePath = join('/avatars', filename);
  const absolutePath = join(process.cwd(), 'public', relativePath);

  try {
    // Ensure the upload directory exists
    await mkdir(join(process.cwd(), 'public', 'avatars'), { recursive: true });
    
    // Save the file
    await writeFile(absolutePath, buffer);

    // Update the user's avatar in the database
    await prisma.user.update({
      where: { id: session.userId as string },
      data: { avatar: relativePath },
    });

    return NextResponse.json({ success: true, avatarUrl: relativePath });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
