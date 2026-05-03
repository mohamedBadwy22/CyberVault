import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { jwtDecode } from "jwt-decode";

export const authOption: NextAuthOptions = {
    providers:[
        Credentials({
            name: "credentials",
            credentials: {
                userId: {},
                password: {},
            },
            authorize: async (credentials) => {
                    const res = await fetch('https://dummyjson.com/auth/login',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({username:credentials?.userId,
                     password:credentials?.password,
                    expiresInMins: 360,}
                    ),
                     credentials: 'include'
                    })
                    const payload = await res.json();      
                    console.log('=================\n from auth.ts \n',payload);
                                                      
                    if (payload.accessToken) {
                        // : {id: string}  , id : decodedToken.id
                        //const decodedToken  = jwtDecode(payload.accessToken);
                        const response = await fetch('https://dummyjson.com/auth/me',{
                        method: 'GET',
                        headers: {
                            'Authorization' : `Bearer ${payload.accessToken}`,
                        },
                        credentials: 'include'
                    })
                    let {role} = await response.json();
                    role === 'moderator' ? role = 'employee' : role = role;
                        return {...payload , user: {role} };
                    } else {
                        return null;
                    }
                }
        })
    ],
    pages:{
        signIn: '/login'
    },
    callbacks:{
    async jwt({ token, user }) {
        if (user) {
            token.token = user.accessToken;
            token.refreshToken = user.refreshToken;
            token.user = user.user;
        }
        return token
    },
    async session({ session, token }) {
        if (token.user) {
            session.user = { ...session.user, ...token.user };
        }
        return session
    }
}}