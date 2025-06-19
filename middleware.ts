  import { withAuth } from 'next-auth/middleware'

  export default withAuth(
    function middleware(req) {
      // Add any additional middleware logic here
    },
    {
      callbacks: {
        authorized: ({ token, req }) => {
          // Protect assessment and dashboard routes
          if (req.nextUrl.pathname.startsWith('/dashboard') || 
              req.nextUrl.pathname.startsWith('/assessment')) {
            return !!token
          }
          return true
        },
      },
    }
  )

  export const config = {
    matcher: ['/dashboard/:path*', '/assessment/:path*']
  }