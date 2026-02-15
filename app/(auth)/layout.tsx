export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div
      className="
        min-h-screen
        flex
        bg-gray-100
      "
    >

      {/* LEFT BRANDING */}
      <div
        className="
          hidden lg:flex
          w-1/2
          relative
          items-center justify-center
          p-16
          overflow-hidden
        "
      >

        {/* Background Image */}
        <div
          className="
            absolute inset-0
            bg-[url('/images/shoes/login.jpg')]
            bg-cover bg-center
            scale-110
            blur-sm
          "
        />

        {/* Dark overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-gray-900/90
            via-gray-800/80
            to-gray-900/90
          "
        />

        {/* glow effect */}
        <div
          className="
            absolute
            w-96 h-96
            bg-gray-400/20
            blur-3xl
            rounded-full
          "
        />

        {/* content */}
        <div className="relative text-white max-w-md">

          <div
            className="
              w-14 h-14
              bg-white/10
              backdrop-blur-md
              rounded-2xl
              flex items-center justify-center
              mb-6
              shadow-lg
              text-2xl
            "
          >
            👟
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            KicksVault
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed">
            Your secure gateway to the ultimate sneaker collection.
            Discover, collect, and manage your kicks with confidence.
          </p>

          <div className="mt-6 text-gray-400 text-sm space-y-1">
            <div>• Premium Sneaker Platform</div>
            <div>• Secure Authentication</div>
            <div>• Modern & Minimal Design</div>
            <div>• Built with Next.js 15</div>
          </div>

        </div>

      </div>


      {/* RIGHT FORM */}
      <div
        className="
          w-full lg:w-1/2
          flex items-center justify-center
          p-6 lg:p-12
         
        "
      >

        <div>
          {children}
        </div>

      </div>


    </div>

  )
}
