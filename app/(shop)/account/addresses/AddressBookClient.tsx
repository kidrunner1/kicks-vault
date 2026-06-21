"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  CheckCircle2,
  Home,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  UserRound,
} from "lucide-react"
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/app/actions/addresses"
import {
  formatAddress,
  getAddressValidationErrors,
  type AddressFieldErrors,
  type AddressInput,
} from "@/lib/address"
import { uiAction } from "@/lib/ui-interactions"
import { Skeleton } from "@/app/component/ui/Skeleton"

export interface AddressView extends AddressInput {
  id: string
  createdAt: string
}

const emptyForm: AddressInput = {
  label: "บ้าน",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  isDefault: false,
}

export default function AddressBookClient({
  addresses,
}: {
  addresses: AddressView[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(addresses.length === 0)
  const [form, setForm] = useState<AddressInput>({
    ...emptyForm,
    isDefault: addresses.length === 0,
  })
  const [fieldErrors, setFieldErrors] = useState<AddressFieldErrors>({})

  const editingAddress = useMemo(
    () => addresses.find((address) => address.id === editingId),
    [addresses, editingId]
  )

  function updateField<K extends keyof AddressInput>(
    field: K,
    value: AddressInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setFieldErrors((current) => {
      if (!current[field]) return current

      const nextErrors = { ...current }
      delete nextErrors[field]

      return nextErrors
    })
  }

  function openCreateForm() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    })
    setFieldErrors({})
    setIsFormOpen(true)
  }

  function openEditForm(address: AddressView) {
    setEditingId(address.id)
    setForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      subdistrict: address.subdistrict,
      district: address.district,
      province: address.province,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    })
    setFieldErrors({})
    setIsFormOpen(true)
  }

  function closeForm() {
    setEditingId(null)
    setIsFormOpen(false)
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    })
    setFieldErrors({})
  }

  function submitForm() {
    const nextFieldErrors = getAddressValidationErrors(form)

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      toast.error("กรุณากรอกข้อมูลที่อยู่ให้ครบ")
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateAddress(editingId, form)
          toast.success("อัปเดตที่อยู่แล้ว")
        } else {
          await createAddress(form)
          toast.success("เพิ่มที่อยู่แล้ว")
        }

        closeForm()
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "ไม่สามารถบันทึกที่อยู่ได้"
        )
      }
    })
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      try {
        await setDefaultAddress(id)
        toast.success("ตั้งเป็นที่อยู่เริ่มต้นแล้ว")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "ไม่สามารถตั้งค่าเริ่มต้นได้"
        )
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("ต้องการลบที่อยู่นี้ใช่หรือไม่?")) return

    startTransition(async () => {
      try {
        await deleteAddress(id)
        toast.success("ลบที่อยู่แล้ว")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "ไม่สามารถลบที่อยู่ได้"
        )
      }
    })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-black/50">ตั้งค่าการจัดส่ง</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">
            ที่อยู่ของฉัน
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
            บันทึกที่อยู่จัดส่ง และเลือกที่อยู่เริ่มต้นสำหรับ Checkout
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className={`h-11 px-5 text-sm font-semibold ${uiAction.accent}`}
        >
          <Plus size={16} />
          เพิ่มที่อยู่
        </button>
      </header>

      {isFormOpen && (
        <section className="rounded-lg border border-black/10 bg-[#f4f3ef] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {editingAddress ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"}
              </h2>
              <p className="mt-1 text-sm text-black/50">
                ข้อมูลผู้รับและตำแหน่งจัดส่งจำเป็นสำหรับ Checkout
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className={`px-4 py-2 text-sm ${uiAction.surface}`}
            >
              ยกเลิก
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AddressInputField
              label="ชื่อที่อยู่"
              value={form.label}
              onChange={(value) => updateField("label", value)}
              placeholder="บ้าน, ที่ทำงาน, Studio"
              error={fieldErrors.label}
              required
            />
            <AddressInputField
              label="ชื่อผู้รับ"
              value={form.recipientName}
              onChange={(value) => updateField("recipientName", value)}
              placeholder="ชื่อ-นามสกุล"
              error={fieldErrors.recipientName}
              required
            />
            <AddressInputField
              label="เบอร์โทร"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="080-000-0000"
              error={fieldErrors.phone}
              required
            />
            <AddressInputField
              label="รหัสไปรษณีย์"
              value={form.postalCode}
              onChange={(value) => updateField("postalCode", value)}
              placeholder="10330"
              error={fieldErrors.postalCode}
              required
            />
            <AddressInputField
              label="ที่อยู่"
              value={form.addressLine1}
              onChange={(value) => updateField("addressLine1", value)}
              placeholder="บ้านเลขที่ อาคาร ถนน"
              error={fieldErrors.addressLine1}
              required
              wide
            />
            <AddressInputField
              label="รายละเอียดเพิ่มเติม"
              value={form.addressLine2 ?? ""}
              onChange={(value) => updateField("addressLine2", value)}
              placeholder="ห้อง ชั้น จุดสังเกต"
              error={fieldErrors.addressLine2}
              wide
            />
            <AddressInputField
              label="ตำบล/แขวง"
              value={form.subdistrict}
              onChange={(value) => updateField("subdistrict", value)}
              placeholder="ตำบล/แขวง"
              error={fieldErrors.subdistrict}
              required
            />
            <AddressInputField
              label="อำเภอ/เขต"
              value={form.district}
              onChange={(value) => updateField("district", value)}
              placeholder="อำเภอ/เขต"
              error={fieldErrors.district}
              required
            />
            <AddressInputField
              label="จังหวัด"
              value={form.province}
              onChange={(value) => updateField("province", value)}
              placeholder="จังหวัด"
              error={fieldErrors.province}
              required
            />
            <label className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => updateField("isDefault", event.target.checked)}
                className="h-4 w-4 accent-black"
              />
              ตั้งเป็นที่อยู่เริ่มต้น
            </label>
          </div>

          <button
            type="button"
            onClick={submitForm}
            disabled={isPending}
            className={`mt-5 h-11 px-5 text-sm font-semibold ${uiAction.accent}`}
          >
            {isPending && <Skeleton tone="light" className="h-4 w-28 bg-white/45" />}
            <span className={isPending ? "sr-only" : ""}>
            {editingAddress ? "บันทึกที่อยู่" : "สร้างที่อยู่"}
            </span>
          </button>
        </section>
      )}

      {addresses.length === 0 ? (
        <section className="rounded-lg border border-black/10 bg-[#f4f3ef] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
            <MapPin size={24} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold">
            ยังไม่มีที่อยู่ที่บันทึกไว้
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/55">
            เพิ่มที่อยู่จัดส่งครั้งเดียว แล้วเลือกใช้ได้จาก Checkout แบบร้านค้าออนไลน์จริง
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={`rounded-lg border p-5 transition ${
                address.isDefault
                  ? "border-black bg-[#f4f3ef]"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                      <Home size={13} />
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7f0] px-3 py-1.5 text-xs font-medium text-[#1f6a3a]">
                        <CheckCircle2 size={13} />
                        ค่าเริ่มต้น
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <UserRound size={15} />
                      {address.recipientName}
                    </span>
                    <span className="inline-flex items-center gap-2 text-black/55">
                      <Phone size={15} />
                      {address.phone}
                    </span>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
                    {formatAddress(address)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isPending}
                      className={`h-10 px-4 text-sm ${uiAction.surface}`}
                    >
                      <Star size={15} />
                      ตั้งเริ่มต้น
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className={`h-10 px-4 text-sm ${uiAction.surface}`}
                  >
                    <Pencil size={15} />
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={isPending}
                    className={`h-10 px-4 text-sm ${uiAction.danger}`}
                  >
                    <Trash2 size={15} />
                    ลบ
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

function AddressInputField({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  wide = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <label className={wide ? "block md:col-span-2" : "block"}>
      <span className="flex items-center gap-1 text-sm text-black/70">
        {label}
        {required ? (
          <span className="text-red-600" aria-label="required">
            *
          </span>
        ) : (
          <span className="text-xs text-black/50">
            ไม่บังคับ
          </span>
        )}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm text-black outline-none transition placeholder:text-black/45 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-black/10 focus:border-black/35"
        }`}
      />
      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </label>
  )
}
