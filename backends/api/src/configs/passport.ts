import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { prisma } from "./db.ts";
import { ENV } from "../configs/env.ts";

var opt: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ENV.JWT_SECRET,
  algorithms: ["HS256"],
  jsonWebTokenOptions: {
    maxAge: "1d",
  },
};

passport.use(
  new JwtStrategy(opt, async (payload: any, done: VerifiedCallback) => {
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
