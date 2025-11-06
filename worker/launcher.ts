import cluster from "cluster";
import os from "os";
const W = Number(process.env.CONCURRENCY || os.cpus().length);
if (cluster.isPrimary) {
  for (let i=0;i<W;i++) cluster.fork();
  cluster.on("exit", ()=> cluster.fork());
} else {
  require("./socialPoster"); // existing worker
}
