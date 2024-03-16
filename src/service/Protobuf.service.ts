import protobuf from "protobufjs";
import * as path from "path";
import { CommandTable } from "./commandTable";

const constMessages = [
  "RequestStartScan",
  "RequestGetApEntries",
  "RequestConnectNew",
  "NotifStartScanning",
  "NotifProvisioningState",
  "ResponseStartScanning",
  "ResponseGetApEntries",
  "ResponseConnectNew",
  //   "RequestCustomPresetUpdate",
  //   "RequestSetCOHNSetting",
  //   "RequestClearCOHNCert",
  //   "RequestCreateCOHNCert",
  //   "RequestSetCameraControlStatus",
  //   "RequestSetTurboActive",
  //   "RequestSetLiveStreamMode",
];

export class ProtobufSevice {
  private extensions: any = [];

  public async load() {
    var root = await protobuf.loadSync(
      __dirname + "/protobuf/network_management.proto"
    );
    for (const message of constMessages) {
      this.extensions[message] = root?.lookupType(`open_gopro.${message}`);
    }
  }

  public decode(data: Buffer): { [k: string]: any } {
    var length = data.slice(0, 1);
    var command = Buffer.from(data.slice(1, 3));
    var payload = Buffer.from(data.slice(3));
    console.log("Data", data);
    console.log("Command", command);
    console.log("Payload", Buffer.from(CommandTable.ResponseStartScanning));

    if (command.equals(Buffer.from(CommandTable.ResponseStartScanning))) {
      var message = this.extensions["ResponseStartScanning"].decode(payload);
      var obj = this.extensions["ResponseStartScanning"].toObject(message);
      obj["type"] = "ResponseStartScanning";
      return obj;
    }

    if (command.equals(Buffer.from(CommandTable.NotifStartScanning))) {
      var message = this.extensions["NotifStartScanning"].decode(payload);
      var obj = this.extensions["NotifStartScanning"].toObject(message);
      obj["type"] = "NotifStartScanning";
      return obj;
    }

    if (command.equals(Buffer.from(CommandTable.ResponseGetApEntries))) {
      var message = this.extensions["ResponseGetApEntries"].decode(payload);
      var obj = this.extensions["ResponseGetApEntries"].toObject(message);
      obj["type"] = "ResponseGetApEntries";
      return obj;
    }

    if (command.equals(Buffer.from(CommandTable.ResponseConnectNew))) {
      var message = this.extensions["ResponseConnectNew"].decode(payload);
      var obj = this.extensions["ResponseConnectNew"].toObject(message);
      obj["type"] = "ResponseConnectNew";
      return obj;
    }

    if (command.equals(Buffer.from(CommandTable.NotifProvisioningState))) {
      var message = this.extensions["NotifProvisioningState"].decode(payload);
      var obj = this.extensions["NotifProvisioningState"].toObject(message);
      obj["type"] = "NotifProvisioningState";
      return obj;
    }

    return { error: "Command not found" };
  }

  public encode(message: { [k: string]: any }, type: string): Buffer {
    var obj = {};
    switch (type) {
      case "RequestStartScan":
        obj = this.extensions["RequestStartScan"].fromObject(message);
        break;
      case "RequestGetApEntries":
        obj = this.extensions["RequestGetApEntries"]!.fromObject(message);
        break;
      case "RequestConnectNew":
        obj = this.extensions["RequestConnectNew"]!.fromObject(message);
        break;
      default:
        throw new Error("Encode type not defined");
    }

    var encoded = this.extensions[type]?.encode(obj).finish();

    return encoded;
  }
}
