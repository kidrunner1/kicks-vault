
import CornerMenu from "../component/ui/CornerMenu"
import FloatingCartButton from "../component/cart/FloatingCartButton"


export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <CornerMenu />
      {children}
      <FloatingCartButton />
    </div>
  )
}
