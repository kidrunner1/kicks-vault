"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: {
    id: string;
    url: string;
  }[];
}

const normalizeImagePath = (url?: string) => {
  if (!url) return "/placeholder.png"

  const cleaned = url.replace(/\\/g, "/")
  return cleaned.startsWith("/") ? cleaned : "/" + cleaned
}

export default function ProductGallery({ images }: Props) {

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-neutral-200 flex items-center justify-center">
        No Image
      </div>
    )
  }

  const [selected, setSelected] = useState(images[0]);

  return (
    <div className="space-y-6">

      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={normalizeImagePath(selected.url)}
              alt="Product image"
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelected(img)}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border ${
              selected?.id === img.id
                ? "border-black"
                : "border-neutral-200"
            }`}
          >
            <Image
              src={normalizeImagePath(img.url)}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

    </div>
  );
}
