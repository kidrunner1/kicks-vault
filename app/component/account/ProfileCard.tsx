interface Props {
  email: string
}

export default function ProfileCard({ email }: Props) {
  return (
    <div className="border border-neutral-800 p-10 rounded-2xl space-y-4">

      <p className="text-neutral-500 text-sm uppercase tracking-wide">
        Email
      </p>

      <p className="text-xl">
        {email}
      </p>

    </div>
  )
}
