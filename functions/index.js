// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Enable CORS

admin.initializeApp();
const db = admin.firestore();

exports.updateDeviceLocation = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    // 1. Only allow POST requests
    if (request.method !== "POST") {
      console.warn("Received non-POST request:", request.method);
      return response.status(405).send("Method Not Allowed");
    }

    // 2. Optional: Simple Secret Key Check (CHANGE 'YOUR_SECRET_KEY_HERE')
    /*
    const secretKey = request.headers["x-secret-key"];
    if (secretKey !== "YOUR_SECRET_KEY_HERE") {
      console.warn("Missing or invalid secret key.");
      return response.status(403).send("Forbidden - Invalid Key");
    }
    */

    // 3. Check request body for required data
    const { deviceId, lat, lng, bat } = request.body;
    if (!deviceId || lat == null || lng == null) {
      console.warn("Missing required data:", request.body);
      return response.status(400).send("Bad Request - Missing required data (deviceId, lat, lng)");
    }

    // --- Update Firestore ---
    try {
      // Assumes device documents use the deviceId as their ID
      const deviceRef = db.collection("devices").doc(String(deviceId));

      const updateData = {
        latestLocation: new admin.firestore.GeoPoint(Number(lat), Number(lng)),
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (bat != null) {
        updateData.batteryLevel = Number(bat);
      }

      // Using update() assumes the device document already exists.
      await deviceRef.update(updateData);
      console.log(`Successfully updated location for device: ${deviceId}`);
      return response.status(200).send("Location updated successfully");

    } catch (error) {
      console.error(`Error updating Firestore for device ${deviceId}:`, error);
      return response.status(500).send("Internal Server Error");
    }
  }); // End of CORS wrapper
}); // End of Cloud Function definition