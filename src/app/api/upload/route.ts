import { NextRequest, NextResponse } from 'next/server';
import { db, documents } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { calculateWeekStartDate, formatDateForDB } from '@/lib/utils/dates';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'weekly_mailing' | 'fact_sheet';
    const yearGroupId = formData.get('yearGroupId') as string | null;
    const weekStartDate = formData.get('weekStartDate') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Document type required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { key, url } = await uploadFile(buffer, file.name, file.type);

    const [document] = await db
      .insert(documents)
      .values({
        type,
        yearGroupId: yearGroupId || null,
        weekStartDate: weekStartDate || formatDateForDB(calculateWeekStartDate()),
        filename: file.name,
        s3Key: key,
        s3Url: url,
        mimeType: file.type,
        fileSize: buffer.length,
        isActive: true,
        version: 1,
      })
      .returning();

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
