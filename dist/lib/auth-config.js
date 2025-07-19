"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const prisma_adapter_1 = require("@auth/prisma-adapter");
const db_1 = require("../lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.authOptions = {
    adapter: (0, prisma_adapter_1.PrismaAdapter)(db_1.prisma),
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        (0, credentials_1.default)({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {
                    return null;
                }
                const user = await db_1.prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user) {
                    return null;
                }
                const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.password || '');
                if (!isPasswordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.avatar = user.avatar;
            }
            if ((account === null || account === void 0 ? void 0 : account.provider) === 'google') {
                // Handle Google OAuth user creation/update
                const existingUser = await db_1.prisma.user.findUnique({
                    where: { email: token.email },
                });
                if (!existingUser) {
                    // Create new user from Google OAuth
                    const newUser = await db_1.prisma.user.create({
                        data: {
                            email: token.email,
                            name: token.name,
                            avatar: token.picture,
                            password: '', // Google users don't need password
                        },
                    });
                    token.id = newUser.id;
                }
                else {
                    token.id = existingUser.id;
                    // Update existing users info if needed
                    if (existingUser.avatar !== token.picture) {
                        await db_1.prisma.user.update({
                            where: { id: existingUser.id },
                            data: { avatar: token.picture },
                        });
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.avatar = token.avatar;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};
