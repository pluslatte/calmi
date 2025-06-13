import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub],
    pages: {
        error: '/auth/error',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('=== SignIn Callback Debug ===');
            console.log('Provider:', account?.provider);
            console.log('Profile keys:', Object.keys(profile || {}));
            console.log('Profile.login:', (profile as any)?.login);

            if (account?.provider !== 'github') {
                console.log('Non-GitHub provider, dening access');
                return false;
            }

            const allowedUsers = process.env.ALLOWED_GITHUB_USERS;
            console.log('Allowed users from env:', allowedUsers);

            if (!allowedUsers) {
                console.warn('ALLOWED_GITHUB_USERS environment variable is not set. Allowing all users.');
                return true;
            }

            const githubUsername = (profile as any)?.login;
            console.log(`GitHub username (login): ${githubUsername}`);

            if (!githubUsername) {
                console.error('GitHub username not found in profile');
                return false;
            }

            console.log(`Register attempt for GitHub user: ${githubUsername}`);
            const allowedUsersList = allowedUsers.split(',').map(u => u.trim());
            console.log('Allowed users list:', allowedUsersList);
            const isAllowed = allowedUsersList.includes(githubUsername);

            if (!isAllowed) {
                console.log(`❌ Access denied for GitHub user: ${githubUsername}`);
                return false;
            } else {
                console.log(`✅ Access granted for GitHub user: ${githubUsername}`);
                return true;
            }
        },
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        jwt({ token, account, profile }) {
            if (account) {
                token.sub = account.providerAccountId;
            }
            return token;
        },
    },
});