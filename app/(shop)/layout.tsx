
import CornerMenu from "../component/ui/CornerMenu"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <CornerMenu />
      {children}
    </div>
  )
}
