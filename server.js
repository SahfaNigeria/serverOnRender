const express = require("express");
const admin = require("firebase-admin");
const app = express();

// Add error checking for Firebase service account
try {
  // Check if environment variable exists
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
  }

  // Fix the private key format
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, "\n")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error("Firebase initialization error:", error);
  process.exit(1); // Exit the process if Firebase can't be initialized
}

app.use(express.json());

// Endpoint to send notification to a specific user
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

// Debugging log (can be removed in production)
console.log(
  "FIREBASE_SERVICE_ACCOUNT exists:",
  !!process.env.FIREBASE_SERVICE_ACCOUNT
);
