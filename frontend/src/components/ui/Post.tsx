import React from "react";
import Avatar from "./Avatar";
import Button from "./Button";

export interface PostProps {
  id?: number | string;
  name: string;
  handle: string;
  time?: string;
  text?: string;
  image?: string;
}

export default function Post({ name, handle, time, text, image }: PostProps) {
  return (
    <article className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar variant="mehmet" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{name}</span>
            <span className="text-gray-400 text-sm">{handle} · {time}</span>
          </div>

          {text && (
            <p className="mt-2 text-sm leading-6 text-gray-100 whitespace-pre-wrap">{text}</p>
          )}

          {/* {image && (
            <div className="mt-3 border border-white border-2 rounded-xl">
              <img src={image} alt="post" className="w-full rounded-lg object-cover max-h-[420px]" />
            </div>
          )} */}
        </div>
      </div>
    </article>
  );
}
