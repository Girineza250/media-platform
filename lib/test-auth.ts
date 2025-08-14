// Test file to verify auth configuration
export async function testAuthSetup() {
  try {
    const { authOptions } = await import("./auth-config")
    console.log("Auth options loaded successfully")
    console.log("Providers:", authOptions.providers?.length)
    return true
  } catch (error) {
    console.error("Auth setup test failed:", error)
    return false
  }
}
