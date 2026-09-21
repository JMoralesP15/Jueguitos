"use client";

import Image from "next/image";
import { useState } from "react";

type BusinessImageProps = {
  alt: string;
  className: string;
  name: string;
  priority?: boolean;
  sizes: string;
  src: string;
};

export function BusinessImage({ alt, className, name, priority = false, sizes, src }: BusinessImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span aria-label={`Sin foto disponible para ${name}`} className={`${className} image-fallback`} role="img">
        {name.slice(0, 1).toLocaleUpperCase("es-CL")}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={480}
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized
      width={640}
    />
  );
}
