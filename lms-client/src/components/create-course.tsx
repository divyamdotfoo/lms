"use client";

import { useState } from "react";
import { DropZone } from "./dropzone";
import { CreatorVideoEditor } from "./creator-video-editor";

export function CreateCourse() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const onUploadComplete = (id: string) => setActiveVideoId(id);
  return (
    <div>
      {!activeVideoId && <DropZone onUploadComplete={onUploadComplete} />}
      <CreatorVideoEditor videoId={activeVideoId} />
    </div>
  );
}
