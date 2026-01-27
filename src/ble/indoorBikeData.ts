//
// FTMS spec
// 4.9 Indoor Bike Data (characteristic)
//

const speedPresent = (flags: number): boolean => ((flags >> 0) & 1) === 0;
const avgSpeedPresent = (flags: number): boolean => ((flags >> 1) & 1) === 1;
const cadencePresent = (flags: number): boolean => ((flags >> 2) & 1) === 1;
const avgCadencePresent = (flags: number): boolean => ((flags >> 3) & 1) === 1;
const distancePresent = (flags: number): boolean => ((flags >> 4) & 1) === 1;
const resistancePresent = (flags: number): boolean => ((flags >> 5) & 1) === 1;
const powerPresent = (flags: number): boolean => ((flags >> 6) & 1) === 1;
const avgPowerPresent = (flags: number): boolean => ((flags >> 7) & 1) === 1;
const expandedEnergyPresent = (flags: number): boolean => ((flags >> 8) & 1) === 1;
const heartRatePresent = (flags: number): boolean => ((flags >> 9) & 1) === 1;
const metabolicEquivalentPresent = (flags: number): boolean => ((flags >> 10) & 1) === 1;
const elapsedTimePresent = (flags: number): boolean => ((flags >> 11) & 1) === 1;
const remainingTimePresent = (flags: number): boolean => ((flags >> 12) & 1) === 1;

type FieldType = 'Uint8' | 'Uint16' | 'Int16' | 'Uint24';

interface FieldDefinition {
  resolution: number;
  unit: string;
  size: number;
  type: FieldType;
  present: (flags: number) => boolean;
  short?: string;
}

const fields: Record<string, FieldDefinition> = {
  Flags: {
    resolution: 1,
    unit: 'bit',
    size: 2,
    type: 'Uint16',
    present: () => true,
  },
  InstantaneousSpeed: {
    resolution: 0.01,
    unit: 'kph',
    size: 2,
    type: 'Uint16',
    present: speedPresent,
    short: 'speed',
  },
  AverageSpeed: {
    resolution: 0.01,
    unit: 'kph',
    size: 2,
    type: 'Uint16',
    present: avgSpeedPresent,
  },
  InstantaneousCadence: {
    resolution: 0.5,
    unit: 'rpm',
    size: 2,
    type: 'Uint16',
    present: cadencePresent,
    short: 'cadence',
  },
  AverageCadence: {
    resolution: 0.5,
    unit: 'rpm',
    size: 2,
    type: 'Uint16',
    present: avgCadencePresent,
  },
  TotalDistance: {
    resolution: 1,
    unit: 'm',
    size: 3,
    type: 'Uint24',
    present: distancePresent,
    short: 'distance',
  },
  ResistanceLevel: {
    resolution: 1,
    unit: 'unitless',
    size: 2,
    type: 'Uint16',
    present: resistancePresent,
  },
  InstantaneousPower: {
    resolution: 1,
    unit: 'W',
    size: 2,
    type: 'Uint16',
    present: powerPresent,
    short: 'power',
  },
  AveragePower: {
    resolution: 1,
    unit: 'W',
    size: 2,
    type: 'Uint16',
    present: avgPowerPresent,
  },
  TotalEnergy: {
    resolution: 1,
    unit: 'kcal',
    size: 2,
    type: 'Int16',
    present: expandedEnergyPresent,
  },
  EnergyPerHour: {
    resolution: 1,
    unit: 'kcal',
    size: 2,
    type: 'Int16',
    present: expandedEnergyPresent,
  },
  EnergyPerMinute: {
    resolution: 1,
    unit: 'kcal',
    size: 1,
    type: 'Uint8',
    present: expandedEnergyPresent,
  },
  HeartRate: {
    resolution: 1,
    unit: 'bpm',
    size: 1,
    type: 'Uint8',
    present: heartRatePresent,
    short: 'heartRate',
  },
  MetabolicEquivalent: {
    resolution: 1,
    unit: 'me',
    size: 1,
    type: 'Uint8',
    present: metabolicEquivalentPresent,
  },
  ElapsedTime: {
    resolution: 1,
    unit: 's',
    size: 2,
    type: 'Uint16',
    present: elapsedTimePresent,
  },
  RemainingTime: {
    resolution: 1,
    unit: 's',
    size: 2,
    type: 'Uint16',
    present: remainingTimePresent,
  },
};

const order: string[] = [
  'Flags',
  'InstantaneousSpeed',
  'AverageSpeed',
  'InstantaneousCadence',
  'AverageCadence',
  'TotalDistance',
  'ResistanceLevel',
  'InstantaneousPower',
  'AveragePower',
  'TotalEnergy',
  'EnergyPerHour',
  'EnergyPerMinute',
  'HeartRate',
  'MetabolicEquivalent',
  'ElapsedTime',
  'RemainingTime',
];

export interface DecodedIndoorBikeData {
  speed: number,
  cadence: number,
  distance: number,
  power: number,
  TotalEnergy: number,
  EnergyPerHour: number,
  EnergyPerMinute: number,
  heartRate: number,
  ElapsedTime: number
}

function getUint24LE(dataview: DataView<ArrayBufferLike>, index = 0) {
  const LSB = dataview.getUint8(index); // LSB
  const MB = dataview.getUint8(index + 1);
  const MSB = dataview.getUint8(index + 2); // MSB

  return (MSB << 16) + (MB << 8) + LSB;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IndoorBikeData(args: Record<string, unknown> = {}) {
  const architecture = true; // little-endian

  function getField(field: FieldDefinition, dataview: DataView, offset: number): number {
    if (field.type === 'Uint24') {
      return getUint24LE(dataview, offset) * field.resolution;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (dataview as any)[`get${field.type}`](offset, architecture) * field.resolution;
  }

  function decode(dataview: DataView): DecodedIndoorBikeData {
    const byteLength = dataview.byteLength;
    let flags = 0;
    let i = 0;
    const data: Record<string, number> = {};

    for (const fieldName of order) {
      const field = fields[fieldName];
      if (!field) continue;

      if (i + field.size > byteLength) break;

      if (field.present(flags)) {
        const value = getField(field, dataview, i);
        const name = field.short ?? fieldName;

        if (fieldName === 'Flags') {
          flags = value;
        } else {
          data[name] = value;
        }
        i += field.size;
      }
    }

    return data as unknown as DecodedIndoorBikeData;
  }

  return Object.freeze({
    getField,
    decode,
  });
}

const indoorBikeData = IndoorBikeData();

export { IndoorBikeData, indoorBikeData };