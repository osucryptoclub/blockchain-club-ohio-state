import Image from "next/image";
import { photos, type PhotoId } from "@/content/photos";

const wall: { id: PhotoId; className: string; sizes: string }[] = [
  { id: "conferenceStage", className: "md:col-span-8 aspect-[3/2] md:aspect-auto", sizes: "(min-width: 768px) 66vw, 100vw" },
  { id: "rareEvo", className: "md:col-span-4 aspect-[3/4]", sizes: "(min-width: 768px) 33vw, 100vw" },
  { id: "conferenceGroup", className: "md:col-span-4 aspect-[4/3]", sizes: "(min-width: 768px) 33vw, 100vw" },
  { id: "rooftop", className: "md:col-span-4 aspect-[4/3]", sizes: "(min-width: 768px) 33vw, 100vw" },
  { id: "classroom", className: "md:col-span-4 aspect-[4/3]", sizes: "(min-width: 768px) 33vw, 100vw" },
];

/** Club photographs. Each drifts slightly inside its frame as it scrolls past. */
export function PhotoWall() {
  return (
    <ul className="grid gap-3 md:grid-cols-12">
      {wall.map(({ id, className, sizes }) => {
        const photo = photos[id];
        const caption = "caption" in photo ? photo.caption : null;
        return (
          <li key={id} className={`relative isolate overflow-hidden bg-panel ${className}`}>
            <Image
              src={photo.full}
              alt={photo.alt}
              fill
              sizes={sizes}
              placeholder="blur"
              className="drift object-cover"
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
  );
}
