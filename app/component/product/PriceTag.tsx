interface Props {
  price: number;
}

export default function PriceTag({ price }: Props) {
  return (
    <div className="text-2xl font-medium">
      ${price.toLocaleString()}
    </div>
  );
}
