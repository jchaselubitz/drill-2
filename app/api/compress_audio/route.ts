// /api/compress_audio/route.ts
import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';

if (!ffmpegStatic) {
  throw new Error('ffmpeg binary path is null');
}
if (!fs.existsSync(ffmpegStatic)) {
  throw new Error(`ffmpeg binary not found at: ${ffmpegStatic}`);
} else {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileField = formData.get('audio');
    if (!fileField || !(fileField instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await fileField.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tmpInputPath = '/tmp/input_audio';
    const tmpOutputPath = '/tmp/output_audio.mp3';

    fs.writeFileSync(tmpInputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tmpInputPath)
        .audioBitrate('64k') // Adjust the bitrate as needed
        .on('end', (_stdout, _stderr) => resolve())
        .on('error', (err: Error) => reject(err))
        .save(tmpOutputPath);
    });

    // Read the compressed file
    const compressedData = fs.readFileSync(tmpOutputPath);

    // Clean up temporary files
    fs.unlinkSync(tmpInputPath);
    fs.unlinkSync(tmpOutputPath);

    // Return the compressed audio as a response
    return new NextResponse(compressedData, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
