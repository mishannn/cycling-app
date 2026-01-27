interface Field {
  resolution: number;
  unit: string;
  size: number;
  type: string;
  present: (flags: number) => boolean;
  short?: string;
}

const speedPresent = (flags: number) => ((flags >> 0) & 1) === 0;
const avgSpeedPresent = (flags: number) => ((flags >> 1) & 1) === 1;
const cadencePresent = (flags: number) => ((flags >> 2) & 1) === 1;
const avgCadencePresent = (flags: number) => ((flags >> 3) & 1) === 1;
const distancePresent = (flags: number) => ((flags >> 4) & 1) === 1;
const resistancePresent = (flags: number) => ((flags >> 5) & 1) === 1;
const powerPresent = (flags: number) => ((flags >> 6) & 1) === 1;
const avgPowerPresent = (flags: number) => ((flags >> 7) & 1) === 1;
const expandedEnergyPresent = (flags: number) => ((flags >> 8) & 1) === 1;
const heartRatePresent = (flags: number) => ((flags >> 9) & 1) === 1;
const metabolicEquivalentPresent = (flags: number) => ((flags >> 10) & 1) === 1;
const elapsedTimePresent = (flags: number) => ((flags >> 11) & 1) === 1;
const remainingTimePresent = (flags: number) => ((flags >> 12) & 1) === 1;

const fields: Record<string, Field> = {
  Flags: {
    resolution: 1,
    unit: "bit",
    size: 2,
    type: "Uint16",
    present: () => true,
  },
  InstantaneousSpeed: {
    resolution: 0.01,
    unit: "kph",
    size: 2,
    type: "Uint16",
    present: speedPresent,
    short: "speed",
  },
  AverageSpeed: {
    resolution: 0.01,
    unit: "kph",
    size: 2,
    type: "Uint16",
    present: avgSpeedPresent,
  },
  InstantaneousCadence: {
    resolution: 0.5,
    unit: "rpm",
    size: 2,
    type: "Uint16",
    present: cadencePresent,
    short: "cadence",
  },
  AverageCadence: {
    resolution: 0.5,
    unit: "rpm",
    size: 2,
    type: "Uint16",
    present: avgCadencePresent,
  },
  TotalDistance: {
    resolution: 1,
    unit: "m",
    size: 3,
    type: "Uint24",
    present: distancePresent,
    short: "distance",
  },
  ResistanceLevel: {
    resolution: 1,
    unit: "unitless",
    size: 2,
    type: "Uint16",
    present: resistancePresent,
  },
  InstantaneousPower: {
    resolution: 1,
    unit: "W",
    size: 2,
    type: "Uint16",
    present: powerPresent,
    short: "power",
  },
  AveragePower: {
    resolution: 1,
    unit: "W",
    size: 2,
    type: "Uint16",
    present: avgPowerPresent,
  },
  TotalEnergy: {
    resolution: 1,
    unit: "kcal",
    size: 2,
    type: "Int16",
    present: expandedEnergyPresent,
  },
  EnergyPerHour: {
    resolution: 1,
    unit: "kcal",
    size: 2,
    type: "Int16",
    present: expandedEnergyPresent,
  },
  EnergyPerMinute: {
    resolution: 1,
    unit: "kcal",
    size: 1,
    type: "Uint8",
    present: expandedEnergyPresent,
  },
  HeartRate: {
    resolution: 1,
    unit: "bpm",
    size: 1,
    type: "Uint8",
    present: heartRatePresent,
    short: "heartRate",
  },
  MetabolicEquivalent: {
    resolution: 1,
    unit: "me",
    size: 1,
    type: "Uint8",
    present: metabolicEquivalentPresent,
  },
  ElapsedTime: {
    resolution: 1,
    unit: "s",
    size: 2,
    type: "Uint16",
    present: elapsedTimePresent,
  },
  RemainingTime: {
    resolution: 1,
    unit: "s",
    size: 2,
    type: "Uint16",
    present: remainingTimePresent,
  },
};

const order = [
  "Flags",
  "InstantaneousSpeed",
  "AverageSpeed",
  "InstantaneousCadence",
  "AverageCadence",
  "TotalDistance",
  "ResistanceLevel",
  "InstantaneousPower",
  "AveragePower",
  "TotalEnergy",
  "EnergyPerHour",
  "EnergyPerMinute",
  "HeartRate",
  "MetabolicEquivalent",
  "ElapsedTime",
  "RemainingTime",
];

function equals(a: unknown, b: unknown) {
  return Object.is(a, b);
}

function getUint24LE(dataview: DataView, index = 0) {
  const LSB = dataview.getUint8(index); // LSB
  const MB = dataview.getUint8(index + 1);
  const MSB = dataview.getUint8(index + 2); // MSB

  return (MSB << 16) + (MB << 8) + LSB;
}

function IndoorBikeData() {
  function getField(field: Field, dataview: DataView, i: number) {
    if (equals(field.type, "Uint24")) {
      return getUint24LE(dataview, i) * field.resolution;
    }

    // Create a type-safe way to call the appropriate DataView method
    const methodName = `get${field.type}` as keyof DataView;
    const method = dataview[methodName];
    if (typeof method === "function") {
      return (
        (method as (index: number) => number).call(dataview, i) *
        field.resolution
      );
    }

    // Fallback for unknown types
    return 0;
  }

  // Dataview -> {'<field-name>': {value: Number, unit: String}}
  function decode(dataview: DataView) {
    const byteLength = dataview.byteLength;

    interface Acc {
      i: number;
      flags: number;
      data: Record<string, number>;
    }

    return order.reduce(
      function (acc: Acc, fieldName: string) {
        const field = fields[fieldName];

        if (acc.i + field.size > byteLength) return acc;

        if (field.present(acc.flags)) {
          const value = getField(field, dataview, acc.i);
          const name = field.short ?? fieldName;

          if (acc.i === 0) {
            acc.flags = value;
          } else {
            acc.data[name] = value;
          }
          acc.i += field.size;
        }

        return acc;
      },
      { i: 0, flags: 0, data: {} },
    ).data;
  }

  return Object.freeze({
    getField,
    decode,
  });
}

const indoorBikeData = IndoorBikeData();

export { IndoorBikeData, indoorBikeData };
