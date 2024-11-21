import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
  try {
    const token = request.cookies.jwt;

    if (!token) {
      return response
        .status(401)
        .json({ message: "You are not authenticated." });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        return response.status(403).json({ message: "Token is not valid." });
      }
      request.userId = payload.userId;
      next();
    });
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    return response.status(500).json({ message: "Internal server error." });
  }
};
