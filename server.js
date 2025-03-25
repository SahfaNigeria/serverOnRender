const express = require("express");
const admin = require("firebase-admin");
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

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
