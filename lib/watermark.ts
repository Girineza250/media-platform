import sharp from "sharp"

export async function watermarkImage(inputBuffer: Buffer, watermarkText = "PREVIEW"): Promise<Buffer> {
  try {
    const textSvg = `
      <svg width="300" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="black" flood-opacity="0.7"/>
          </filter>
        </defs>
        <rect width="300" height="80" fill="rgba(0,0,0,0.8)" rx="10"/>
        <text x="150" y="45" font-family="Arial, sans-serif" font-size="24" fill="white" 
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
          gravity: "center",
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
