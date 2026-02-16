import Link from "next/link"

export default function AdminPage() {

  return (

    <div className="text-gray-100">

      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-8">
        Admin Dashboard
      </h1>



      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


        {/* SHOES CARD */}
        <Link
          href="/admin/shoes"
          className="
            bg-gray-900
            border border-gray-800
            rounded-xl
            p-6
            hover:bg-gray-800
            transition
            group
          "
        >

          <div className="text-sm text-gray-400 mb-2">
            Management
          </div>

          <div className="text-xl font-medium mb-1">
            Shoes
          </div>

          <div className="text-gray-500 text-sm">
            Manage all shoes in database
          </div>

          <div className="
            mt-4
            text-blue-400
            group-hover:text-blue-300
          ">
            Open →
          </div>

        </Link>



        {/* ADD SHOE CARD */}
        <Link
          href="/admin/shoes/new"
          className="
            bg-gray-900
            border border-gray-800
            rounded-xl
            p-6
            hover:bg-gray-800
            transition
            group
          "
        >

          <div className="text-sm text-gray-400 mb-2">
            Create
          </div>

          <div className="text-xl font-medium mb-1">
            Add New Shoe
          </div>

          <div className="text-gray-500 text-sm">
            Add a new shoe to database
          </div>

          <div className="
            mt-4
            text-blue-400
            group-hover:text-blue-300
          ">
            Create →
          </div>

        </Link>



        {/* FUTURE CARD */}
        <div
          className="
            bg-gray-900
            border border-gray-800
            rounded-xl
            p-6
            opacity-60
          "
        >

          <div className="text-sm text-gray-400 mb-2">
            Coming soon
          </div>

          <div className="text-xl font-medium mb-1">
            Brands
          </div>

          <div className="text-gray-500 text-sm">
            Brand management panel
          </div>

        </div>


      </div>


    </div>

  )

}
