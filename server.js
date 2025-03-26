const express = require("express");
const admin = require("firebase-admin");
const app = express();

// Log all environment variables for debugging
console.log("All Environment Variables:");
Object.keys(process.env).forEach((key) => {
  console.log(`${key}: ${process.env[key]}`);
});

// Alternative Firebase initialization
try {
  const serviceAccount = {
    type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,

    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri:
      process.env.FIREBASE_AUTH_URI ||
      "https://accounts.google.com/o/oauth2/auth",
    token_uri:
      process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_CERT_URL ||
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
  };

  console.log(
    "Constructed Service Account:",
    JSON.stringify(serviceAccount, null, 2)
  );
  console.log("FIREBASE ENV VARIABLES:");
  console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
  console.log("FIREBASE_PRIVATE_KEY_ID:", process.env.FIREBASE_PRIVATE_KEY_ID);
  console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
  console.log(
    "FIREBASE_PRIVATE_KEY:",
    process.env.FIREBASE_PRIVATE_KEY ? "Exists" : "Missing"
  );

  // Validate required fields
  const requiredFields = [
    "project_id",
    "private_key_id",
    "client_email",
    "private_key",
  ];
  const missingFields = requiredFields.filter(
    (field) => !serviceAccount[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration fields: ${missingFields.join(
        ", "
      )}`
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("CRITICAL Firebase initialization error:", error);
  // Uncomment the next line if you want the process to exit on initialization failure
  // process.exit(1);
}

app.use(express.json());

// Your existing notification endpoint
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
