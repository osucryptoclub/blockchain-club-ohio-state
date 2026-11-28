/**
 * Club photographs and the order they appear in the introduction.
 *
 * To add one, put two copies in src/assets/photos/: `name.webp` (up to 1920px
 * wide) and `name-sm.webp` (900px wide). Strip location data, and blur name
 * badges and license plates first. Only publish photos people agreed to.
 * Captions state what is visible in the photo. Never name people in them. A
 * scene caption must be true of every photo in that scene.
 */

import type { StaticImageData } from "next/image";
import austinNight from "@/assets/photos/austin-night.webp";
import austinNightSm from "@/assets/photos/austin-night-sm.webp";
import classroom from "@/assets/photos/classroom.webp";
import classroomSm from "@/assets/photos/classroom-sm.webp";
import clubRoom from "@/assets/photos/club-room.webp";
import clubRoomSm from "@/assets/photos/club-room-sm.webp";
import conferenceGroup from "@/assets/photos/conference-group.webp";
import conferenceGroupSm from "@/assets/photos/conference-group-sm.webp";
import conferenceStage from "@/assets/photos/conference-stage.webp";
import conferenceStageSm from "@/assets/photos/conference-stage-sm.webp";
import meeting from "@/assets/photos/meeting.webp";
import meetingSm from "@/assets/photos/meeting-sm.webp";
import members from "@/assets/photos/members.webp";
import membersSm from "@/assets/photos/members-sm.webp";
import rareEvo from "@/assets/photos/rare-evo.webp";
import rareEvoSm from "@/assets/photos/rare-evo-sm.webp";
import rooftop from "@/assets/photos/rooftop.webp";
import rooftopSm from "@/assets/photos/rooftop-sm.webp";

type Photo = {
  full: StaticImageData;
  small: StaticImageData;
  alt: string;
  caption?: string;
  /** The point to keep in view when the photo is cropped, from the top left. */
  focus: [number, number];
};

export const photos = {
  classroom: {
    full: classroom,
    small: classroomSm,
    alt: "Students standing arm in arm in a classroom after a meeting.",
    focus: [0.5, 0.55],
  },
  clubRoom: {
    full: clubRoom,
    small: clubRoomSm,
    alt: "A large group of students in matching club shirts.",
    focus: [0.5, 0.5],
  },
  meeting: {
    full: meeting,
    small: meetingSm,
    alt: "A full room of students applauds three speakers at the front of a meeting.",
    focus: [0.5, 0.5],
  },
  members: {
    full: members,
    small: membersSm,
    alt: "Twelve students standing arm in arm in front of a glass wall at night.",
    focus: [0.5, 0.55],
  },
  rareEvo: {
    full: rareEvo,
    small: rareEvoSm,
    alt: "Two students in front of a banner that reads Welcome to Rare Evo 2026.",
    caption: "Rare Evo 2026",
    focus: [0.5, 0.52],
  },
  rooftop: {
    full: rooftop,
    small: rooftopSm,
    alt: "A speaker addresses a circle of students and guests on a rooftop at sunset.",
    focus: [0.36, 0.68],
  },
  austinNight: {
    full: austinNight,
    small: austinNightSm,
    alt: "About twenty students at night beneath a lit sign in Austin, Texas.",
    caption: "Austin, Texas",
    focus: [0.5, 0.55],
  },
  conferenceGroup: {
    full: conferenceGroup,
    small: conferenceGroupSm,
    alt: "Eleven students in front of a conference backdrop covered in sponsor logos.",
    caption: "University Blockchain Conference, Austin",
    focus: [0.5, 0.48],
  },
  conferenceStage: {
    full: conferenceStage,
    small: conferenceStageSm,
    alt: "A panel on stage beside a University Blockchain Conference banner for UT Austin, November 20 to 21, 2026.",
    caption: "University Blockchain Conference, UT Austin, November 2026",
    focus: [0.62, 0.5],
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

/** `rect` is left, top, width, height as fractions of the screen. */
export type Tile = { photo: PhotoId; rect: [number, number, number, number]; drift: [number, number] };

export type Scene = { word: string; align?: "right"; caption?: string; wide: Tile[]; tall: Tile[] };

/** The photographic part of the introduction. The last scene holds the button. */
export const scenes: Scene[] = [
  {
    word: "Learn.",
    wide: [
      { photo: "meeting", rect: [0.05, 0.1, 0.5, 0.6], drift: [-0.02, 0] },
      { photo: "members", rect: [0.47, 0.36, 0.48, 0.47], drift: [0.02, -0.01] },
    ],
    tall: [
      { photo: "meeting", rect: [0, 0.13, 1, 0.34], drift: [-0.02, 0] },
      { photo: "members", rect: [0, 0.48, 1, 0.28], drift: [0.02, 0] },
    ],
  },
  {
    word: "Belong.",
    wide: [
      { photo: "classroom", rect: [0.05, 0.1, 0.5, 0.62], drift: [-0.02, 0] },
      { photo: "clubRoom", rect: [0.47, 0.36, 0.48, 0.47], drift: [0.02, -0.01] },
    ],
    tall: [
      { photo: "classroom", rect: [0, 0.14, 1, 0.3], drift: [-0.02, 0] },
      { photo: "clubRoom", rect: [0, 0.45, 1, 0.28], drift: [0.02, 0] },
    ],
  },
  {
    word: "Connect.",
    align: "right",
    wide: [
      { photo: "rareEvo", rect: [0, 0, 0.47, 1], drift: [0, -0.02] },
      { photo: "rooftop", rect: [0.47, 0, 0.53, 1], drift: [0, 0.02] },
    ],
    tall: [{ photo: "rareEvo", rect: [0, 0.1, 1, 0.62], drift: [0, -0.02] }],
  },
  {
    word: "Show up.",
    caption: "Austin, Texas",
    wide: [{ photo: "austinNight", rect: [0, 0, 1, 1], drift: [0.02, 0] }],
    tall: [{ photo: "austinNight", rect: [0, 0.2, 1, 0.4], drift: [0.02, 0] }],
  },
  {
    word: "Together.",
    caption: "University Blockchain Conference",
    wide: [{ photo: "conferenceGroup", rect: [0, 0, 1, 1], drift: [0, -0.02] }],
    tall: [{ photo: "conferenceGroup", rect: [0, 0.22, 1, 0.38], drift: [0.01, 0] }],
  },
  {
    word: "Build what comes next.",
    caption: "University Blockchain Conference, UT Austin, November 2026",
    wide: [{ photo: "conferenceStage", rect: [0, 0, 1, 1], drift: [-0.02, 0] }],
    tall: [{ photo: "conferenceStage", rect: [0, 0.1, 1, 0.46], drift: [-0.02, 0] }],
  },
];
