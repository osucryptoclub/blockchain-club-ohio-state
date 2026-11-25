import Image from "next/image";
import type { CSSProperties } from "react";
import { photos, type PhotoId } from "@/content/photos";

/** Where each photo hangs: position on screen, depth, turn, and width. */
const path: { id: PhotoId; x: number; y: number; z: number; turn: number; width: number }[] = [
  { id: "meeting", x: 25, y: 50, z: 1300, turn: 16, width: 46 },
  { id: "classroom", x: 75, y: 50, z: 2100, turn: -16, width: 46 },
  { id: "rareEvo", x: 22, y: 50, z: 2900, turn: 18, width: 30 },
  { id: "rooftop", x: 75, y: 48, z: 3700, turn: -18, width: 44 },
  { id: "members", x: 25, y: 52, z: 4500, turn: 16, width: 48 },
  { id: "clubRoom", x: 76, y: 54, z: 5300, turn: -16, width: 48 },
  { id: "austinNight", x: 25, y: 50, z: 6100, turn: 14, width: 46 },
  { id: "conferenceGroup", x: 75, y: 50, z: 6900, turn: -14, width: 46 },
  { id: "conferenceStage", x: 50, y: 50, z: 7800, turn: 0, width: 64 },
];

/** How far the camera travels over the section, in pixels of depth. */
const LENGTH = 7700;

/**
 * Club photographs hung along a corridor of dark space. Scrolling moves the
 * camera through them. Where scroll-driven animation is missing, or reduced
 * motion is on, the same list is set in columns.
 */
export function PhotoFlight({ title, titleId }: { title: string; titleId: string }) {
  return (
    <div className="flight" style={{ "--length": `${LENGTH}px` } as CSSProperties}>
      <div className="flight-stage">
        <div aria-hidden="true" className="flight-glow" />
        <div className="flight-camera shell">
          <h2 id={titleId} className="flight-title metal wide mb-12 max-w-[14ch] text-title">
            {title}
          </h2>
          <ul className="flight-list columns-2 gap-3 md:columns-3">
            {path.map(({ id, x, y, z, turn, width }) => {
              const photo = photos[id];
              const caption = "caption" in photo ? photo.caption : null;
              return (
                <li
                  key={id}
                  className="flight-photo relative mb-3 aspect-(--ratio) break-inside-avoid overflow-hidden bg-panel"
                  style={
                    {
                      "--x": `${x}%`,
                      "--y": `${y}%`,
                      "--z": `${-z}px`,
                      "--turn": `${turn}deg`,
                      "--w": `${width}vw`,
                      "--ratio": photo.full.width / photo.full.height,
                      "--at": (z / LENGTH).toFixed(3),
                    } as CSSProperties
                  }
                >
                  <Image
                    src={photo.full}
                    alt={photo.alt}
                    sizes="(min-width: 768px) 50vw, 80vw"
                    placeholder="blur"
                    className="size-full object-cover"
                    style={{ objectPosition: `${photo.focus[0] * 100}% ${photo.focus[1] * 100}%` }}
                  />
                  {caption && (
                    <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black to-transparent px-5 pt-16 pb-4 text-sm font-medium">
                      {caption}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
