import { crc32, deflateSync } from 'node:zlib';

export const MEDIA_ATTACHMENTS = [
    {
        id: 'a2',
        message_id: 'msg1',
        filename: 'image',
        status: 'clean',
        mime: 'image/png',
        bytes: '2048',
        kind: 'image',
        extraction_status: 'unsupported',
    },
    {
        id: 'a3',
        message_id: 'msg3',
        filename: 'video.mp4',
        status: 'clean',
        mime: 'video/mp4',
        bytes: '12582912',
        kind: 'video',
        extraction_status: 'unsupported',
    },
];

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BIT_DEPTH = 8;
const TRUECOLOR = 2;

function chunk(type: string, data: Buffer): Buffer {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const length = Buffer.alloc(4);
    const checksum = Buffer.alloc(4);

    length.writeUInt32BE(data.length);
    checksum.writeUInt32BE(crc32(body));

    return Buffer.concat([length, body, checksum]);
}

export function solidPng(width: number, height: number, rgb: [number, number, number]): Buffer {
    const header = Buffer.alloc(13);

    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header.writeUInt8(BIT_DEPTH, 8);
    header.writeUInt8(TRUECOLOR, 9);
    const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: width }, () => rgb).flat())]);
    const pixels = Buffer.concat(Array.from({ length: height }, () => row));

    return Buffer.concat([
        PNG_SIGNATURE,
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(pixels)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}
