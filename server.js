const express = require("express");
const admin = require("firebase-admin");
const app = express();

// Add comprehensive debugging
console.log("Environment variables:");
console.log(JSON.stringify(process.env, null, 2));

// Comprehensive error handling for Firebase initialization
try {
  // Explicit check and logging
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  console.log("Raw FIREBASE_SERVICE_ACCOUNT:", serviceAccountEnv);
  console.log("FIREBASE_SERVICE_ACCOUNT type:", typeof serviceAccountEnv);
  console.log(
    "FIREBASE_SERVICE_ACCOUNT length:",
    serviceAccountEnv ? serviceAccountEnv.length : "N/A"
  );

  if (!serviceAccountEnv) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is MISSING");
  }

  // Attempt to parse with more robust error handling
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountEnv.replace(/\\n/g, "\n"));
  } catch (parseError) {
    console.error("JSON Parsing Error:", parseError);
    console.error("Problematic JSON string:", serviceAccountEnv);
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("CRITICAL Firebase initialization error:", error);
  // Optionally, you might want to exit the process
  // process.exit(1);
}

app.use(express.json());

// Existing notification endpoint
app.post("/send-notification", async (req, res) => {
  try {
    const { recipientToken, title, body, data } = req.body;

    const message = {
      token: recipientToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
    };

    const response = await admin.messaging().send(message);
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
