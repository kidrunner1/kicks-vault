export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-black to-gray-800 text-white items-center justify-center p-16">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            My SaaS App 🚀
          </h1>
          <p className="text-gray-300">
            Secure authentication built with
            <br />
            Next.js + Prisma + JWT
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-100 p-8">
        {children}
      </div>
    </div>
  )
}
