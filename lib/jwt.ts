import { SignJWT, jwtVerify, JWTPayload } from "jose"

const secret = process.env.JWT_SECRET

if (!secret) {
  throw new Error("JWT_SECRET is not defined")
}

const secretKey = new TextEncoder().encode(secret)

export interface TokenPayload extends JWTPayload {
  userId: string
  role: string
}

export async function signToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secretKey)

  if (!payload.userId || !payload.role) {
    throw new Error("Invalid token structure")
  }

  return payload as TokenPayload
}

export async function signAccessToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secretKey)
}

export async function signRefreshToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey)
}

