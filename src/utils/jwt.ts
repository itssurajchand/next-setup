import { ErrorHandlingService } from "@/services/ErrorHandling.service";
import { sign, verify } from "jsonwebtoken";

const generateToken = (payload: Record<any, any>, expiresIn = "30d") => {
  const secret = process.env.JWT_SECRET ?? "";
  return sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET ?? "";
    const decoded = verify(token, secret);
    return decoded;
  } catch (error: any) {
    throw ErrorHandlingService.badRequest({
      message: error.message,
    });
  }
};

const jwt = {
  generateToken,
  verifyToken,
};

export { jwt };
