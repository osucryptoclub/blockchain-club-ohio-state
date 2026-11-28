import Image from "next/image";
import type { CampusPhoto } from "@/content/campus";

/**
 * A campus photograph that fills its (relative) parent, darkened so white text
 * reads on top. `fade` sets which side stays darkest: where the text sits.
 */
export function CampusBackdrop({
  photo,
  fade = "left",
  priority = false,
}: {
  photo: CampusPhoto;
  fade?: "left" | "bottom";
  priority?: boolean;
}) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-black">
      <Image
        src={photo.image}
        alt=""
        fill
        priority={priority}
        placeholder="blur"
        sizes="100vw"
        className="campus-photo object-cover"
        style={{ objectPosition: photo.position }}
      />
      <div
        className={
          fade === "left"
            ? "absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.92)_0%,rgb(0_0_0/0.78)_38%,rgb(0_0_0/0.35)_75%,rgb(0_0_0/0.25)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.75)_45%,rgb(0_0_0/0.92)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.5)_0%,rgb(0_0_0/0.72)_50%,rgb(0_0_0/0.93)_100%)]"
        }
      />
      {/* Scarlet light from below, and a fade into the black page. */}
      <div className="absolute inset-0 bg-[radial-gradient(60rem_22rem_at_85%_105%,rgb(187_0_0/0.45),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-black" />
    </div>
  );
}

/** The photo's credit, as its license asks. */
export function PhotoCredit({ photo, className = "" }: { photo: CampusPhoto; className?: string }) {
  return (
    <p className={`text-xs text-white/80 ${className}`}>
      <a href={photo.source} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {photo.place}
      </a>{" "}
      · Photo: {photo.author},{" "}
      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {photo.license}
      </a>
    </p>
  );
}
