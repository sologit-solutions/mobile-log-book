import passport from "passport";
import passportJwt from "passport-jwt";
import type { StrategyOptions, VerifiedCallback } from "passport-jwt";
import { prisma } from "./db.ts";
import { ENV } from "../configs/env.ts";

const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

const opt: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ENV.JWT_SECRET,
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(opt, async (payload, done: VerifiedCallback) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (user) {
        return done(null, { id: user.id });
      }
      return done(null, false);
    } catch (e) {
      return done(e, false);
    }
  }),
);

export default passport;
