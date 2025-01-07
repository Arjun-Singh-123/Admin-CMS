// // Initialize Supabase
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );

// Store connected clients
import { NextRequest, NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import os from "os";

const clients: Set<WebSocket> = new Set();
let wss: WebSocketServer | null = null;

function getCpuUsage() {
  const cpus = os.cpus();
  const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const total = cpus.reduce(
    (acc, cpu) =>
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq,
    0
  );
  return ((1 - idle / total) * 100).toFixed(2);
}

function getMemoryUsage() {
  const free = os.freemem();
  const total = os.totalmem();
  return (((total - free) / total) * 100).toFixed(2);
}

export function GET(req: NextRequest) {
  if (req.headers.get("upgrade") !== "websocket") {
    return new NextResponse("Expected Upgrade: websocket", { status: 426 });
  }

  const { socket: res, response } = Reflect.get(req, "socket");

  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws) => {
      clients.add(ws);
      console.log("Client connected");

      ws.on("close", () => {
        clients.delete(ws);
        console.log("Client disconnected");
      });
    });

    setInterval(() => {
      const metric = {
        timestamp: new Date().toISOString(),
        cpu: getCpuUsage(),
        memory: getMemoryUsage(),
      };

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(metric));
        }
      });
    }, 1000);
  }

  wss.handleUpgrade(req, res, [], (ws) => {
    wss!.emit("connection", ws, req);
  });

  return response;
}
