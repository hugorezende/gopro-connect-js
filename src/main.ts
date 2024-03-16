import fastify, { FastifyRequest } from "fastify";
import { GoProAdapterService } from "./service/GoproAdapter.service";

const server = fastify();
var goProAdapterService = new GoProAdapterService();

server.get("/discover", async (request, reply) => {
  var t = await goProAdapterService.initializeAndDiscover();
  reply.header("Content-Type", "application/json");
  reply.send(t);
});

interface IQuerystring {
  id: string;
}

server.get(
  "/connect/:id",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    const { id } = request.params;
    var t = await goProAdapterService.connectToDevice(id);
    return t;
  }
);

server.get(
  "/start-scan",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    const { id } = request.params;
    var t = await goProAdapterService.startScanAp();
    return t;
  }
);

server.get(
  "/get-ap-scan",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    return goProAdapterService.getApScanData();
  }
);

server.get(
  "/full",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    var result = await goProAdapterService.initializeAndDiscoverAuto();
    return result;
  }
);

server.get(
  "/new-connection",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    var result = await goProAdapterService.apNewConnection(
      "access-point-name",
      "password"
    );
    reply.header("Content-Type", "application/json");
    reply.send(result);
  }
);

server.get(
  "/disconnect",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    var result = await goProAdapterService.apDisconnect();
    reply.header("Content-Type", "application/json");
    reply.send(result);
  }
);

server.get(
  "/shutter/:id",
  async (request: FastifyRequest<{ Params: IQuerystring }>, reply) => {
    const { id } = request.params;
    let on = false;
    if (id === "on") {
      on = true;
    }
    var result = await goProAdapterService.setShutter(on);
    reply.header("Content-Type", "application/json");
    reply.send(result);
  }
);

server.listen({ port: 9080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
