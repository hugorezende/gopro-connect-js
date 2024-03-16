export enum CharId {
  /* 
  Check details
  https://gopro.github.io/OpenGoPro/ble/protocol/ble_setup.html#ble-characteristics 
  */
  WIFI_AP_SSID = "b5f90002aa8d11e390460002a5d5c51b",
  WIFI_AP_PASSWORD = "b5f90003aa8d11e390460002a5d5c51b",
  WIFI_AP_POWER = "b5f90004aa8d11e390460002a5d5c51b",
  WIFI_AP_STATE = "b5f90005aa8d11e390460002a5d5c51b",

  COMMAND = "b5f90072aa8d11e390460002a5d5c51b",
  COMMAND_RESPONSE = "b5f90073aa8d11e390460002a5d5c51b",

  NETWORK_MANAGEMENT_COMMAND = "b5f90091aa8d11e390460002a5d5c51b",
  NETWORK_MANAGEMENT_RESPONSE = "b5f90092aa8d11e390460002a5d5c51b",
}

export enum IComandTypes {
  NOTIFY_START_SCANNING = "NotifStartScanning",
  RESPONSE_GET_AP_ENTRIES = "ResponseGetApEntries",
}

export interface INotifStartScanning {
  scanningState: number;
  scanId: number;
  totalEntries: number;
  totalConfiguredSsid: number;
  type: IComandTypes.NOTIFY_START_SCANNING;
}

export interface IResponseGetApEntries {
  result: number;
  scanId: number;
  entries: {
    ssid: string;
    signalStrengthBars: number;
    signalFrequencyMhz: number;
    scanEntryFlags: number;
  }[];
  type: IComandTypes.RESPONSE_GET_AP_ENTRIES;
}

export interface IRequestGetApEntries {
  startIndex: number;
  maxEntries: number;
  scanId: number;
}

export interface IRequestConnectNew {
  ssid: string;
  password: string;
}
