import jwt from "jsonwebtoken";

export default function generateToken(id, role, schoolID) {
  return jwt.sign({ id, role, schoolID }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}
