import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPersonBiking, faPersonBikingMountain, faPersonRunning, faPersonSkating, faPersonSkiing, faPersonSkiingNordic } from '@fortawesome/sharp-regular-svg-icons';


export type Sport = {
  icon:       IconDefinition;
  name:       string;
  numSeasons: number;
  startYear:  number;
}

export default {
  cold: [
    {
      icon:       faPersonSkating,
      name:      'Nordic Skating',
      numSeasons: 3,
      startYear:  2020,
    },
    {
      icon:       faPersonSkiingNordic,
      name:      'XC Skiing',
      numSeasons: 3,
      startYear:  2020,
    },
    {
      icon:       faPersonSkiing,
      name:      'Alpine Skiing',
      numSeasons: 11,
      startYear:  2004,
    },
  ],
  warm: [
    {
      icon:       faPersonBiking,
      name:      'Cycling',
      numSeasons: 12,
      startYear:  2009,
    },
    {
      icon:       faPersonBikingMountain,
      name:      'Mountain Biking',
      numSeasons: 8,
      startYear:  2008,
    },
    {
      icon:       faPersonRunning,
      name:      'Running',
      numSeasons: 5,
      startYear:  2019,
    },
  ],
};
