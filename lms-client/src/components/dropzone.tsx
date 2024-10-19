"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "@/utils";
export function DropZone({
  onUploadComplete,
}: {
  onUploadComplete: (id: string) => void;
}) {
  const [progress, setProgress] = useState(0);

  const config: AxiosRequestConfig = {
    onUploadProgress: function (progressEvent) {
      if (progressEvent.total) {
        const percentComplete = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setProgress(percentComplete);
      }
    },
  };

  const handleDrop = async (file: File[]) => {
    const formData = new FormData();

    formData.append("file", file[0]);
    try {
      const { data } = await axios.post(`${BASE_URL}/upload`, formData, config);
      if (!data) setProgress(0);
      onUploadComplete(data.id);
    } catch (e) {
      setProgress(0);
      console.log(e);
    }
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop: handleDrop,
      accept: { "video/mp4": [] },
      multiple: false,
    });

  return (
    <div>
      <p className=" text-center text-lg pb-4">Drop your course video below</p>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-96 h-64 p-6 border-2 border-dashed rounded-lg cursor-pointer 
        ${isDragActive ? "border-green-500" : "border-gray-300"} 
        `}
      >
        <input {...getInputProps()} />
        {progress > 1 ? (
          <div className="w-80 h-4 flex items-center justify-center relative rounded-3xl border-white border">
            <p className=" text-xs z-10">{progress}%</p>
            <p
              className=" h-full absolute left-0 rounded-full bg-green-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            ></p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Only .mp4 files are accepted</p>
        )}
      </div>
    </div>
  );
}
