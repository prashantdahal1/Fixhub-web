import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Replace these with process.env variables in production
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "PASTE_YOUR_CLIENT_ID_HERE";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "PASTE_YOUR_CLIENT_SECRET_HERE";

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback", // Note: Ensure this matches exactly with Google Console
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in our db
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error("No email found from Google profile"), undefined);
                }

                let user = await UserModel.findOne({ email });

                if (!user) {
                    // Create new user if not exists
                    const dummyPassword = Math.random().toString(36).slice(-10) + "A1!";
                    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
                    
                    user = await UserModel.create({
                        firstName: profile.name?.givenName || "User",
                        lastName: profile.name?.familyName || "",
                        email: email,
                        username: `user_${profile.id}`,
                        password: hashedPassword,
                        role: "customer",
                        profilePicture: profile.photos?.[0].value || "",
                        status: "active"
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
);

// Serialize user into the sessions
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
