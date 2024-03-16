import { Characteristic } from "@abandonware/noble";
import { CommandTable } from "./commandTable";
import { ProtobufSevice } from "./Protobuf.service";
import { IRequestConnectNew, IRequestGetApEntries } from "../models/models";

export class CommandService {
  private extensions: any = [];

  public requestStartScan(char: Characteristic) {
    var length = new Uint8Array([0x02]);
    const command = new Uint8Array([
      ...length,
      ...CommandTable.RequestStartScan,
    ]);
    this.sendCommand(char, command);
  }

  public async requestGetApEntries(
    char: Characteristic,
    scanId: number,
    maxEntries: number
  ) {
    const payloadObj: IRequestGetApEntries = {
      startIndex: 0,
      maxEntries,
      scanId,
    };

    var protobuf = new ProtobufSevice();
    await protobuf.load();
    const payloadEncoded = protobuf.encode(payloadObj, "RequestGetApEntries");

    const command = new Uint8Array([
      ...Uint8Array.from([payloadEncoded.length + 2]),
      ...CommandTable.RequestGetApEntries,
      ...payloadEncoded,
    ]);

    this.sendCommand(char, command);
  }

  public async requestNewAPConnection(
    char: Characteristic,
    ssid: string,
    password: string
  ) {
    const payload: IRequestConnectNew = {
      ssid,
      password,
    };

    var protobuf = new ProtobufSevice();
    await protobuf.load();
    const payloadEncoded = protobuf.encode(payload, "RequestConnectNew");

    const bufferArray = this.splitBuffer(
      payloadEncoded,
      CommandTable.RequestConnectNew
    );
    for (var buffer of bufferArray) {
      this.sendCommand(char, buffer);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  public async apControlOn(char: Characteristic) {
    var length = new Uint8Array([0x03]);
    const command = new Uint8Array([
      ...length,
      ...CommandTable.SetApControl,
      0x01,
      0x01,
    ]);

    this.sendCommand(char, command);
  }

  public async shutter(char: Characteristic, on: boolean) {
    var totalLength = new Uint8Array([0x03]);
    var messageLength = new Uint8Array([0x01]);
    const command = new Uint8Array([
      ...totalLength,
      ...CommandTable.SetShutter,
      ...messageLength,
      on ? 0x01 : 0x00, //message
    ]);

    this.sendCommand(char, command);
  }

  private sendCommand(char: Characteristic, command: Uint8Array) {
    char.write(Buffer.from(command), false, (error) => {
      console.log("Writing...");
      if (error) {
        console.error("Error writing:", error);
        return;
      }
      return "ok";
    });
  }

  private splitBuffer(data: Buffer, actionId: Uint8Array): Buffer[] {
    if (data.length < 17) {
      let headerSize = data.length + 2;
      const packet = new Uint8Array([
        ...Uint8Array.from([headerSize]),
        ...actionId,
        ...data,
      ]);
      return [Buffer.from(packet)];
    }

    // const commandBuffer = Buffer.from(command);
    var bufferArray: Buffer[] = [];
    var bufferLength = data.length;
    var packageLength = 19;
    var packageCount = Math.ceil(bufferLength / packageLength);

    /* 
    first 3 bits (001) indicates 13bit packets 
    the next 5 bits are the message length
    */
    var totalLength = bufferLength - 1; // 2 bytes for message size
    var number = totalLength + 8195;

    const messageSize = Buffer.from([number >> 8, number & 0xff]); // convert message size to 2 bytes
    const packet = new Uint8Array([
      ...messageSize,
      ...actionId,
      ...data.slice(0, 16),
    ]);
    bufferArray.push(Buffer.from(packet));

    // contnuation packages
    for (var i = 0; i < packageCount - 1; i++) {
      var start = i * packageLength + 16;
      var end = start + packageLength;
      var slicedPacket = new Uint8Array([
        ...Uint8Array.from([0x80 + (i % 8)]),
        ...data.slice(start, end),
      ]);
      bufferArray.push(Buffer.from(slicedPacket));
    }
    return bufferArray;
  }

  public async decodeMessage(
    dataArray: Buffer[]
  ): Promise<{ [k: string]: any }> {
    var payloadArray: Buffer[] = [];
    for (var d of dataArray) {
      if (d[0] == 32) {
        // if is first package skip 4th bytes on message
        payloadArray.push(d.slice(0, 1));
        payloadArray.push(d.slice(2));
      } else if (d[0] > 32) {
        // if is continuation package skip first byte on message
        payloadArray.push(d.slice(1));
      } else {
        payloadArray.push(d);
      }
    }
    var flatBuffer = Buffer.concat(payloadArray);
    var protobuf = new ProtobufSevice();

    await protobuf.load();
    var decodedMessage = protobuf.decode(flatBuffer);
    return Promise.resolve(decodedMessage);
  }

  public test() {
    console.log(this.extensions["NotifStartScanning"]);
  }
}
