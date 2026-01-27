import { BleClient, numberToUUID } from "@capacitor-community/bluetooth-le";
import { indoorBikeData } from "./indoorBikeData";

// Define the interface for the data returned by indoorBikeData.decode
interface BikeData {
  speed?: number;
  heartRate?: number;
  cadence?: number;
  distance?: number;
  power?: number;
  [key: string]: number | undefined;
}

const FTMS_SERVICE_UUID = numberToUUID(0x1826);
const INDOOR_BIKE_DATA_UUID = numberToUUID(0x2ad2);

export async function connectToBikeAndReadData(
  callback: (data: BikeData) => void,
) {
  await BleClient.initialize();

  console.log("Сканирование устройств...");
  const device = await BleClient.requestDevice({
    services: [FTMS_SERVICE_UUID],
  });

  console.log(`Подключение к устройству: ${device.name}`);
  await BleClient.connect(device.deviceId, async () => {
    console.log("Соединение разорвано");
  });

  console.log("Включение уведомлений для характеристики Indoor Bike Data...");
  await BleClient.startNotifications(
    device.deviceId,
    FTMS_SERVICE_UUID,
    INDOOR_BIKE_DATA_UUID,
    (value) => {
      callback(indoorBikeData.decode(value));
    },
  );
}
