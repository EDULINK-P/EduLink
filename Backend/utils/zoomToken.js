import fetch from "node-fetch";
import { ZOOM_CONFIG } from "../config/zoom.js";

export async function getZoomAccessToken() {
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_CONFIG.accountId}`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic" +
          Buffer.from(
            `${ZOOM_CONFIG.clientId}:${ZOOM_CONFIG.clientSecret}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const data = await res.json();
  if (!data.access_token) {
    console.error("Failed to get Zoom access token", data);
    throw new Error("Failed to get Zoom access token");
  }
  return data.access_token;
}
