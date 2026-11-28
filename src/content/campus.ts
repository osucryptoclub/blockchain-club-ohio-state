/**
 * Ohio State campus photography. Every photo is from Wikimedia Commons under
 * an open license, and is credited where it appears. Keep the credit fields
 * accurate: CC BY-SA requires the author's name and a link to the license.
 *
 * To add one: save a JPEG about 2400px wide in src/assets/campus/, then add
 * an entry with its author, license, and the Commons file page as `source`.
 */

import type { StaticImageData } from "next/image";
import ohioStadium from "@/assets/campus/ohio-stadium.jpg";
import ovalFog from "@/assets/campus/oval-fog.jpg";
import stadiumRotunda from "@/assets/campus/stadium-rotunda.jpg";
import universityHall from "@/assets/campus/university-hall.jpg";

export type CampusPhoto = {
  image: StaticImageData;
  alt: string;
  /** The landmark, shown in the credit. */
  place: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  /** CSS object-position, to keep the landmark in frame on narrow screens. */
  position?: string;
};

const ccBySa = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };

export const campus = {
  stadium: {
    image: ohioStadium,
    alt: "Ohio Stadium from the air, seen from its southern end, with campus beyond",
    place: "Ohio Stadium",
    author: "Lectrician2",
    ...ccBySa,
    source: "https://commons.wikimedia.org/wiki/File:Ohio_Stadium_Aerial.jpg",
    position: "50% 55%",
  },
  universityHall: {
    image: universityHall,
    alt: "University Hall’s clock tower at the head of the Oval, framed by trees",
    place: "University Hall",
    author: "John Dewees",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "https://commons.wikimedia.org/wiki/File:Ohio-Columbus-University-Hall-2017-10-21-003.jpg",
    position: "50% 40%",
  },
  rotunda: {
    image: stadiumRotunda,
    alt: "The coffered half dome of Ohio Stadium’s north rotunda",
    place: "Ohio Stadium rotunda",
    author: "RightCowLeftCoast",
    ...ccBySa,
    source: "https://commons.wikimedia.org/wiki/File:Ohio_Stadium_north_rotunda.jpg",
    position: "50% 30%",
  },
  ovalFog: {
    image: ovalFog,
    alt: "The Oval at night in fog, lit by a row of lamps",
    place: "The Oval",
    author: "Kevin Payravi",
    ...ccBySa,
    source: "https://commons.wikimedia.org/wiki/File:The_Oval_in_fog,_The_Ohio_State_University.jpg",
    position: "50% 60%",
  },
} satisfies Record<string, CampusPhoto>;
