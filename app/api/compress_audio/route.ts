// app/api/compress_audio/route.ts
import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
  if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
  } else {
    return;
  }
  try {
    const formData = await req.formData();
    const fileField = formData.get('audio');
    if (!fileField || !(fileField instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await fileField.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempInputPath = path.join(os.tmpdir(), fileField.name);
    const tempOutputPath = path.join(os.tmpdir(), `compressed-${fileField.name}`);

    fs.writeFileSync(tempInputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .audioBitrate('64k') // Adjust the bitrate as needed
        .on('end', (_stdout, _stderr) => resolve())
        .on('error', (err: Error) => reject(err))
        .save(tempOutputPath);
    });

    // Read the compressed file
    const compressedData = fs.readFileSync(tempOutputPath);

    // Clean up temporary files
    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(tempOutputPath);

    // Return the compressed audio as a response
    return new NextResponse(compressedData, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
