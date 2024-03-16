import noble, { Peripheral } from "@abandonware/noble";
import { CommandService } from "./Comand.service";
import {
  CharId,
  IComandTypes,
  INotifStartScanning,
  IResponseGetApEntries,
} from "../models/models";

enum BleStatus {
  POWERED_ON = "poweredOn",
}

enum BleEvent {
  STATE_CHANGE = "stateChange",
  DISCOVER = "discover",
}

export class GoProAdapterService {
  private characteristics: noble.Characteristic[] = [];
  private discoverStoped: boolean = false;
  private listOfBleDevices: Peripheral[] = [];

  private connectedDeviceId: string = "";
  private commandService = new CommandService();
  private discoverageDelay = 10000;

  private apScanData: INotifStartScanning | undefined = undefined;
  private apAvailable: IResponseGetApEntries | undefined = undefined;
  private packageBuffers: Buffer[] = [];
  private bytesToRead: number = 0;

  public initializeAndDiscover(): Promise<{ id: string; name: string }[]> {
    noble.on(BleEvent.STATE_CHANGE, (state) => {
      if (!this.discoverStoped) {
        if (state === BleStatus.POWERED_ON) {
          noble.startScanning();
          console.log("Scanning for Bluetooth devices...");
        } else {
          noble.stopScanning();
          console.log("Bluetooth not powered on. Exiting.");
        }
      }
    });

    noble.on(BleEvent.DISCOVER, (peripheral) => {
      try {
        if (!this.discoverStoped) {
          var deviceName = peripheral.advertisement.localName;
          if (
            deviceName &&
            !this.listOfBleDevices
              .map((item) => item.advertisement.localName)
              .includes(deviceName)
          ) {
            this.listOfBleDevices.push(peripheral);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        noble.stopScanning();
        return resolve(
          this.listOfBleDevices.map((item) => {
            return {
              id: item.id,
              name: item.advertisement.localName,
            };
          })
        );
      }, this.discoverageDelay);
    });
  }

  public connectToDevice(id: string): Promise<string> {
    const peripheral = this.listOfBleDevices.find((item) => item.id === id);
    if (!peripheral) {
      return new Promise((resolve) => {
        console.log("ERR:", "Device not found.");
        resolve("Device not found.");
      });
    }

    return new Promise((resolve) => {
      console.log("Connecting to device:", peripheral.advertisement.localName);
      peripheral.connect((error) => {
        if (error) {
          console.error("Error connecting to device:", error);
          resolve("Error connecting to device.");
          return;
        }
        console.log("Connected to device:", peripheral.advertisement.localName);
        this.subsctribeToCharacteristics(peripheral);
        this.connectedDeviceId = peripheral.id;
        resolve("Connected to device.");
        return;
      });
    });
  }

  public initializeAndDiscoverAuto(): Promise<string> {
    const gopro = this.listOfBleDevices.find(
      (item) => item.id === "1043b660791a88f134a637736d6405b5"
    );
    if (gopro?.state === "connected") {
      return new Promise((resolve) => {
        resolve("Device already connected.");
      });
    }
    noble.on(BleEvent.STATE_CHANGE, (state) => {
      if (!this.discoverStoped) {
        if (state === BleStatus.POWERED_ON) {
          noble.startScanning();
          console.log("Scanning for Bluetooth devices...");
        } else {
          noble.stopScanning();
          console.log("Bluetooth not powered on. Exiting.");
        }
      }
    });

    return new Promise((resolve, reject) => {
      noble.on(BleEvent.DISCOVER, (peripheral) => {
        try {
          if (!this.discoverStoped) {
            if (peripheral.id === "1043b660791a88f134a637736d6405b5") {
              this.listOfBleDevices = [peripheral];
              this.connectToDevice(peripheral.id);
              noble.stopScanning();
              resolve("Successifully connected");
            }
          }
        } catch (e) {
          console.log(e);
          noble.stopScanning();
          reject();
        }
      });
    });
  }

  private subsctribeToCharacteristics(peripheral: Peripheral) {
    peripheral.discoverAllServicesAndCharacteristics(
      (error, services, characteristics) => {
        if (error) {
          console.error(
            "Error discovering services and characteristics:",
            error
          );
          return;
        }

        services.map((service) => {
          service.characteristics.map((characteristic) => {
            this.characteristics.push(characteristic);
            if (characteristic.properties.includes("notify")) {
              console.log(
                "Subscribing to characteristic:",
                characteristic.uuid
              );
              characteristic.notify(true, (error) => {
                if (error) {
                  console.error("Error subscribing to characteristic:", error);
                  return;
                }
              });

              characteristic.on("data", async (data, isNotification) => {
                console.log(
                  "Received data from characteristic:",
                  characteristic.uuid,
                  data,
                  isNotification
                );

                // If first byte is 0x20 or 0x21, it means that it is the first packet of
                if (data[0] == 0x20 || data[0] == 0x21) {
                  const hexString = data.slice(0, 2).toString("hex"); // Convert buffer to hexadecimal string
                  this.bytesToRead = parseInt(hexString, 16) & 0x0fff;

                  this.packageBuffers.push(data);
                  this.bytesToRead -= 18;
                  return;
                }
                this.packageBuffers.push(data);
                this.bytesToRead -= 19;
                if (this.bytesToRead > 0) {
                  return;
                }

                var message = await this.commandService.decodeMessage(
                  this.packageBuffers
                );
                // clear buffer if message is complete
                this.packageBuffers = [];
                this.bytesToRead = 0;

                console.log("-----------------");
                console.log(message);
                console.log("-----------------");

                this.processResponseMessage(message);
              });
            }
          });
        });
      }
    );
  }

  private processResponseMessage(message: any) {
    switch (message["type"]) {
      case IComandTypes.NOTIFY_START_SCANNING:
        console.log(1);
        this.apScanData = message as INotifStartScanning;
        break;

      case IComandTypes.RESPONSE_GET_AP_ENTRIES:
        console.log(2);
        this.apAvailable = message as IResponseGetApEntries;
        break;
      default:
    }
  }

  public getApScanData() {
    var char = this.getCharacterisct(CharId.NETWORK_MANAGEMENT_COMMAND);
    if (!char) {
      return "Characteristic not found";
    }
    if (this.apScanData) {
      this.commandService.requestGetApEntries(
        char,
        this.apScanData.scanId,
        this.apScanData.totalEntries - 1
      );
      return this.apAvailable;
    }
  }

  public async startScanAp() {
    if (this.connectedDeviceId === "") {
      return "No device connected";
    }
    var char = this.getCharacterisct(CharId.NETWORK_MANAGEMENT_COMMAND);
    if (!char) {
      return "Characteristic not found";
    }
    var response = await this.commandService.requestStartScan(char);
    return response;
  }

  public async apNewConnection(ssid: string, password: string) {
    if (this.connectedDeviceId === "") {
      return "No device connected";
    }
    var char = this.getCharacterisct(CharId.NETWORK_MANAGEMENT_COMMAND);
    if (!char) {
      return "Characteristic not found";
    }
    const response = await this.commandService.requestNewAPConnection(
      char,
      ssid,
      password
    );
    return response;
  }

  public async apDisconnect() {
    if (this.connectedDeviceId === "") {
      return "No device connected";
    }
    var char = this.getCharacterisct(CharId.COMMAND);
    if (!char) {
      return "Characteristic not found";
    }
    this.commandService.apControlOn(char);
  }

  public setShutter(on: boolean) {
    if (this.connectedDeviceId === "") {
      return "No device connected";
    }
    var char = this.getCharacterisct(CharId.COMMAND);
    if (!char) {
      return "Characteristic not found";
    }
    this.commandService.shutter(char, on);
  }

  private getCharacterisct(
    characteristicId: CharId
  ): noble.Characteristic | undefined {
    return this.characteristics.find((c) => c.uuid == characteristicId);
  }
}
