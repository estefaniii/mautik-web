import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Adapter, AdapterUser } from 'next-auth/adapters';

// Custom Adapter para limpiar password si no existe
function CustomPrismaAdapter(prisma: any): Adapter {
	const adapter = PrismaAdapter(prisma);
	return {
		...adapter,
		async createUser(user: AdapterUser) {
			// Elimina password si no es una cadena real
			if (
				!('password' in user) ||
				typeof user.password !== 'string' ||
				user.password === ''
			) {
				delete (user as any).password;
			}
			// Transforma image a avatar si existe
			if ('image' in user && user.image) {
				(user as any).avatar = user.image;
				delete (user as any).image;
			}
			// Elimina emailVerified si existe
			if ('emailVerified' in user) {
				delete (user as any).emailVerified;
			}
			if (adapter.createUser) {
				return adapter.createUser(user);
			}
			throw new Error('Adapter does not implement createUser');
		},
	};
}

export const authOptions: NextAuthOptions = {
	adapter: CustomPrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user) {
					return null;
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password,
					user.password || '',
				);

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
			// Siempre buscar el usuario por email y usar el id real de la base de datos
			if (token.email) {
				const dbUser = await prisma.user.findUnique({
					where: { email: token.email },
				});
				if (dbUser) {
					token.id = dbUser.id;
					token.isAdmin = dbUser.isAdmin ?? false;
					token.avatar = dbUser.avatar;
				}
			}
			if (user) {
				token.isAdmin = (user as any).isAdmin ?? false;
			}
			if (account?.provider === 'google') {
				// (Ya cubierto por la lógica anterior)
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				(session.user as any).id = token.id as string;
				(session.user as any).avatar = token.avatar as string;
				// Propagar isAdmin
				(session.user as any).isAdmin = token.isAdmin ?? false;
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
};
