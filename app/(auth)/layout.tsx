export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div className="
      min-h-screen
      flex
      bg-gradient-to-br
      from-blue-100 via-white to-blue-200
    ">


      {/* LEFT BRANDING */}
      <div className="
        hidden lg:flex
        w-1/2
        relative
        items-center justify-center
        p-16
      ">

        {/* glow effect */}
        <div className="
          absolute
          inset-0
          bg-gradient-to-br
          from-black
          via-gray-900
          to-gray-800
        "/>

        <div className="
          absolute
          w-96 h-96
          bg-blue-500/20
          blur-3xl
          rounded-full
        "/>

        {/* content */}
        <div className="relative text-white max-w-md">

          <div className="
            w-14 h-14
            bg-white/10
            backdrop-blur-md
            rounded-2xl
            flex items-center justify-center
            mb-6
            shadow-lg
          ">
            🚀
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            My SaaS App
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed">
            Secure authentication system built with modern technologies.
          </p>

          <div className="mt-6 text-gray-400 text-sm space-y-1">
            <div>• Next.js 15</div>
            <div>• Prisma ORM</div>
            <div>• JWT Authentication</div>
            <div>• Secure Cookies</div>
          </div>

        </div>

      </div>



      {/* RIGHT FORM */}
      <div className="
        w-full lg:w-1/2
        flex items-center justify-center
        p-6 lg:p-12
      ">

        <div className="w-full max-w-md">
          {children}
        </div>

      </div>


    </div>

  )
}
