import sharp from "sharp"

export async function watermarkImage(inputBuffer: Buffer, watermarkText = "PREVIEW"): Promise<Buffer> {
  try {
    const textSvg = `
      <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
          </filter>
        </defs>
        <rect width="200" height="50" fill="rgba(0,0,0,0.7)" rx="5"/>
        <text x="100" y="32" font-family="Arial, sans-serif" font-size="16" fill="white" 
              text-anchor="middle" font-weight="bold" filter="url(#shadow)">
          ${watermarkText}
        </text>
      </svg>
    `

    const watermarkBuffer = Buffer.from(textSvg)

    return await sharp(inputBuffer)
      .composite([
        {
          input: watermarkBuffer,
          gravity: "southeast",
          blend: "over",
        },
      ])
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch (error) {
    console.error("Error watermarking image:", error)
    throw new Error("Failed to watermark image")
  }
}

export function generateSecureUrl(mediaId: string, userId: string, expiresIn = 3600): string {
  const timestamp = Date.now() + expiresIn * 1000
  const token = Buffer.from(`${mediaId}:${userId}:${timestamp}`).toString("base64")
  return `/api/media/download/${mediaId}?token=${token}`
}

export function verifySecureToken(token: string, mediaId: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [tokenMediaId, tokenUserId, timestamp] = decoded.split(":")

    return tokenMediaId === mediaId && tokenUserId === userId && Number.parseInt(timestamp) > Date.now()
  } catch {
    return false
  }
}
