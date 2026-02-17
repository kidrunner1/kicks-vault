interface Props {
  specs: {
    id: string;
    label: string;
    value: string;
  }[];
}

export default function ProductSpecs({ specs }: Props) {
  if (!specs.length) return null;

  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-medium mb-6">Specifications</h3>

      <div className="space-y-4">
        {specs.map((spec) => (
          <div
            key={spec.id}
            className="flex justify-between text-sm"
          >
            <span className="text-neutral-500">
              {spec.label}
            </span>
            <span className="font-medium">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
