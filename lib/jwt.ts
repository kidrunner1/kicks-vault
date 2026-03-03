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

// 🔐 ACCESS TOKEN
export async function signAccessToken(payload: {
  userId: string
  role: string
}) {
  return new SignJWT({
    ...payload,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(getSecretKey())
}

// 🔐 REFRESH TOKEN
export async function signRefreshToken(payload: {
  userId: string
  role: string
}) {
  return new SignJWT({
    ...payload,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecretKey())
}

// ✅ VERIFY ACCESS ONLY
export async function verifyAccessToken(
  token: string
): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey())

  if (
    !payload.userId ||
    !payload.role ||
    payload.type !== "access"
  ) {
    throw new Error("Invalid access token")
  }

  return payload as TokenPayload
}

// ✅ VERIFY REFRESH ONLY
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey())

  if (
    !payload.userId ||
    !payload.role ||
    payload.type !== "refresh"
  ) {
    throw new Error("Invalid refresh token")
  }

  return payload as TokenPayload
}