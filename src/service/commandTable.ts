export const CommandTable = {
  SetApControl: Uint8Array.from([0x17]),
  SetShutter: Uint8Array.from([0x01]),

  RequestStartScan: Uint8Array.from([0x02, 0x02]),
  RequestGetApEntries: Uint8Array.from([0x02, 0x03]),
  RequestConnect: Uint8Array.from([0x02, 0x04]),
  RequestConnectNew: Uint8Array.from([0x02, 0x05]),

  ResponseStartScanning: Uint8Array.from([0x02, 0x82]),
  ResponseGetApEntries: Uint8Array.from([0x02, 0x83]),
  ResponseConnect: Uint8Array.from([0x02, 0x84]),
  ResponseConnectNew: Uint8Array.from([0x02, 0x85]),
  NotifProvisioningState: Uint8Array.from([0x02, 0x0c]),
  NotifStartScanning: Uint8Array.from([0x02, 0x0b]),
};

Uint8Array.from([0x02, 0x02]); //RequestStartScan
Uint8Array.from([0x02, 0x03]); //RequestGetApEntries
Uint8Array.from([0x02, 0x04]); //RequestConnect
Uint8Array.from([0x02, 0x05]); //RequestConnectNew
Uint8Array.from([0x02, 0x0b]); //NotifStartScanning
Uint8Array.from([0x02, 0x0c]); //NotifProvisioningState,
Uint8Array.from([0x02, 0x82]); //ResponseStartScanning
Uint8Array.from([0x02, 0x83]); //ResponseGetApEntries,
Uint8Array.from([0x02, 0x84]); //ResponseConnect
Uint8Array.from([0x02, 0x85]); //ResponseConnectNew

Uint8Array.from([0xf1, 0x64]); //RequestCustomPresetUpdate
Uint8Array.from([0xf1, 0x65]); //RequestSetCOHNSetting
Uint8Array.from([0xf1, 0x66]); //RequestClearCOHNCert
Uint8Array.from([0xf1, 0x67]); //RequestCreateCOHNCert
Uint8Array.from([0xf1, 0x69]); //RequestSetCameraControlStatus
Uint8Array.from([0xf1, 0x6b]); //RequestSetTurboActive
Uint8Array.from([0xf1, 0x79]); //RequestSetLiveStreamMode
Uint8Array.from([0xf1, 0xe4]); //ResponseGeneric
Uint8Array.from([0xf1, 0xe5]); //ResponseGeneric
Uint8Array.from([0xf1, 0xe6]); //ResponseGeneric
Uint8Array.from([0xf1, 0xe7]); //ResponseGeneric
Uint8Array.from([0xf1, 0xe9]); //ResponseGeneric
Uint8Array.from([0xf1, 0xeb]); //ResponseGeneric
Uint8Array.from([0xf1, 0xf9]); //ResponseGeneric

Uint8Array.from([0xf5, 0x6d]); //RequestGetLastCapturedMedia
Uint8Array.from([0xf5, 0x6e]); //RequestCOHNCert
Uint8Array.from([0xf5, 0x6f]); //RequestGetCOHNStatus
Uint8Array.from([0xf5, 0x72]); //RequestGetPresetStatus
Uint8Array.from([0xf5, 0x74]); //RequestGetLiveStreamStatus
Uint8Array.from([0xf5, 0xed]); //ResponseLastCapturedMedia
Uint8Array.from([0xf5, 0xee]); //ResponseCOHNCert
Uint8Array.from([0xf5, 0xef]); //NotifyCOHNStatus
Uint8Array.from([0xf5, 0xef]); //NotifyCOHNStatus
Uint8Array.from([0xf5, 0xf2]); //NotifyPresetStatus
Uint8Array.from([0xf5, 0xf3]); //NotifyPresetStatus
Uint8Array.from([0xf5, 0xf4]); //NotifyLiveStreamStatus
Uint8Array.from([0xf5, 0xf5]); //NotifyLiveStreamStatus
