import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login" },
})

export const config = {
  matcher: ["/dashboard/:path*", "/monthly/:path*", "/book/:path*"],
}
