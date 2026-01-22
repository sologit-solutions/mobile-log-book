import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "./db.ts";
import jwt from "jsonwebtoken";
import { ENV } from "../configs/env.ts";

var options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ENV.JWT_SECRET,
  algorithms: ["HS256"] as jwt.Algorithm[],
  jsonWebTokenOptions: {
    maxAge: "1d",
  },
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.sub },
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (e) {
      return done(e, false);
    }
  }),
);

export default passport;
