"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ResponsiveImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  imageClassName?: string;
};

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  imageClassName,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(true);

  if (!loaded) {
    return null;
  }

  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading="lazy"
        onError={() => setLoaded(false)}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </div>
  );
}
