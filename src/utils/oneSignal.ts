const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

if (!oneSignalAppId || !oneSignalApiKey) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: ONESIGNAL_APP_ID or ONESIGNAL_API_KEY is missing from the environment variables.",
  );
}

export const sendPushNotification = async (
  userId: string,
  title: string,
  content: string,
): Promise<void> => {
  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        target_channel: "push",
        include_aliases: { external_id: [userId] },
        headings: { en: title },
        contents: { en: content },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OneSignal push failed (${response.status}): ${errorBody}`);
    }
  } catch (error: any) {
    console.error(`OneSignal push failed: ${error.message}`);
  }
};
