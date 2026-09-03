import { createApp } from "./app.mjs";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";

createApp().listen(port, host, () => {
  console.log(`Quanmin TCM FDE landing app listening on http://${host}:${port}`);
  console.log(`Local: http://127.0.0.1:${port}`);
});
