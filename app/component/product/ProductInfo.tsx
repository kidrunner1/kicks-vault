import PriceTag from "./PriceTag";

interface Props {
  product: any;
}

export default function ProductInfo({ product }: Props) {
  return (
    <div className="flex flex-col justify-center space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-neutral-500">
          {product.brand}
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold mt-2">
          {product.name}
        </h1>
      </div>

      <PriceTag price={product.price} />

      <p className="text-neutral-600 leading-relaxed max-w-lg">
        {product.description}
      </p>
    </div>
  );
}
