"use client";

import { BASE_URL } from "@/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export function CoursePlayer({ parts }: { parts: any[] }) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(0);
  useEffect(() => {
    const part = searchParams.get("v");
    if (part) {
      const idx = parts.findIndex((p) => p.id === part);
      if (idx !== -1) {
        setActive(idx);
      }
    }
  }, [searchParams]);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div suppressHydrationWarning>
      <ReactPlayer
        key={parts[active].id}
        playing={true}
        url={`${BASE_URL}/video/${parts[active].id}`}
        autoPlay={true}
        controls={true}
        onEnded={() => {
          if (active < parts.length - 1) {
            router.push(`${pathname}?v=${parts[active + 1].id}`);
          }
        }}
      />
      <p className=" text-2xl pt-4 pl-3">Part id: {parts[active].id}</p>
    </div>
  );
}
