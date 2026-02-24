import { SignJWT, jwtVerify, JWTPayload } from "jose"

function getSecretKey() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not defined")
  }

  return new TextEncoder().encode(secret)
}

export interface TokenPayload extends JWTPayload {
  userId: string
  role: string
  type: "access" | "refresh"
}

export async function signAccessToken(payload: {
  userId: string
  role: string
}) {
  const secretKey = getSecretKey()

  return await new SignJWT({
    ...payload,
    type: "access"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secretKey)
}

export async function signRefreshToken(payload: {
  userId: string
  role: string
}) {
  const secretKey = getSecretKey()

  return await new SignJWT({
    ...payload,
    type: "refresh"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const secretKey = getSecretKey()

  const { payload } = await jwtVerify(token, secretKey)

  if (!payload.userId || !payload.role || !payload.type) {
    throw new Error("Invalid token structure")
  }

  return payload as TokenPayload
}
