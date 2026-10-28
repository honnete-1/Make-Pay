/**
 * Photography manifest. Every photo is a real, openly licensed image from
 * Wikimedia Commons, downloaded into /public/images/photos and resized for
 * the web. Credits render on /credits and are listed in IMAGE_CREDITS.md —
 * keep all three in sync when swapping an image.
 */
export type Photo = {
  src: string;
  alt: string;
  /** CSS object-position for the subject, so crops keep the moto in frame. */
  focus: string;
  credit: { author: string; license: string; licenseUrl: string; source: string; place: string };
};

const BY_SA_4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };
const BY_2 = { license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/" };

export const MEDIA = {
  heroPrices: {
    src: "/images/photos/moto-sunset-kigali.jpg",
    alt: "A moto rider and helmeted passenger silhouetted against a Kigali sunset",
    focus: "42% 60%",
    credit: {
      author: "Emmanuel Kwizera",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:A_motorist_carries_a_passenger_amid_a_beautiful_sunset_in_the_sky_of_Kigali._Emmanuel_Kwizera.jpg",
      place: "Kigali, 2019",
    },
  },
  heroKilometres: {
    src: "/images/photos/moto-road-kigali.jpg",
    alt: "A helmeted moto-taxi rider riding down a tree-lined road in Kigali in soft morning light",
    focus: "24% 70%",
    credit: {
      author: "Gael Varoquaux",
      ...BY_2,
      source: "https://commons.wikimedia.org/wiki/File:Motorcycle_cruising_down_Kigali_streets_-_Flickr_-_Gael_Varoquaux.jpg",
      place: "Kigali, 2023",
    },
  },
  heroArrive: {
    src: "/images/photos/boda-boda-kigali.jpg",
    alt: "A moto-taxi rider and passenger in helmets arriving along a cobbled street in Kigali",
    focus: "58% 60%",
    credit: {
      author: "Zenith4237",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:Boda-boda_in_Kigali.jpg",
      place: "Kigali, 2018",
    },
  },
  stage: {
    src: "/images/photos/riders-nyabugogo.jpg",
    alt: "A line of moto-taxi riders in green helmets waiting for passengers at Nyabugogo, Kigali",
    focus: "50% 55%",
    credit: {
      author: "Mrbobax",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:Motorcylists_at_Nyabugogo_Park.jpg",
      place: "Nyabugogo, Kigali, 2020",
    },
  },
  aerial: {
    src: "/images/photos/kigali-aerial-street.jpg",
    alt: "High-angle view of a busy Kigali boulevard winding between trees and buildings",
    focus: "70% 60%",
    credit: {
      author: "Emmanuel Kwizera",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:High_Angle_View_Of_Kigali_City_Street_on_November_29,_2018._Emmanuel_Kwizera.jpg",
      place: "Kigali, 2018",
    },
  },
  street: {
    src: "/images/photos/kigali-cbd-street.jpg",
    alt: "A moto taxi with a passenger moving through a busy street in central Kigali",
    focus: "30% 60%",
    credit: {
      author: "ITU Regional Development Forum for Africa",
      ...BY_2,
      source: "https://commons.wikimedia.org/wiki/File:Kigali_street_scene_2016.jpg",
      place: "Kigali CBD, 2016",
    },
  },
  rider: {
    src: "/images/photos/rider-passenger-rwanda.jpg",
    alt: "A moto-taxi rider and passenger, both in green helmets, riding past a brick wall in Rwanda",
    focus: "35% 55%",
    credit: {
      author: "Emmynoah",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:Photo12_commercial_motocyclist_with_a_passenger.jpg",
      place: "Rwanda, 2020",
    },
  },
  dusk: {
    src: "/images/photos/kigali-hills-sunset.jpg",
    alt: "The sun setting over Kigali's hills from the Rwandex road",
    focus: "30% 55%",
    credit: {
      author: "Ndpatrick45",
      ...BY_SA_4,
      source: "https://commons.wikimedia.org/wiki/File:Kigali_thousand_hills_horizon_as_the_sun_sets.jpg",
      place: "Kigali, 2020",
    },
  },
} satisfies Record<string, Photo>;

export type MediaKey = keyof typeof MEDIA;
