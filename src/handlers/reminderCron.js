const { sendWhatsAppMessage, ApiService } = require("../services");

/**
 * Reminders Lambda Function
 * Gets available reminders for all clients
 */
exports.handler = async (event, context) => {
  console.log("Reminders function invoked:", JSON.stringify(event, null, 2));

  // Array of clients to check reminders for
  const clients = ["THEEDTR", "THEEDSA"];

  try {
    const apiService = new ApiService();

    // Sign in first to get access token
    console.log("Signing in to get access token...");
    const accessToken = await apiService.getAccessToken();
    console.log("Successfully obtained access token");

    // Get reminders for each client
    const remindersData = {};

    for (const client of clients) {
      try {
        console.log(`Fetching reminders for client: ${client}`);

        const response = await apiService.request(
          `https://editorapp-be.fly.dev/api/${client}/bookings/remindersAvailable`,
          {
            method: "GET",
          },
        );

        const bookingList = response.data || [];
        const bookingMap = {};

        bookingList.forEach((booking) => {
          if (bookingMap[booking.id]) {
            bookingMap[booking.id].push(booking);
          } else {
            bookingMap[booking.id] = [booking];
          }
        });

        const promisesToBeDone = Object.keys(bookingMap).map(async x=> {
            const bookings = bookingMap[x];
            if()


        })

        const reminders = await Promise.all(promisesToBeDone);

        const response = await apiService.request(
          `https://editorapp-be.fly.dev/api/${client}/bookings/updateReminderSent`,
          {
            method: "POST",
            body: {
                bookingList: bookingList.map(x=> x.id);
            }
          },
        );

        console.log(`Successfully fetched reminders for ${client}`);

      } catch (error) {
        console.error(`Error fetching reminders for ${client}:`, error.message);
        remindersData[client] = {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "ok",
        timestamp: new Date().toISOString(),
        authenticated: true,
        clients: clients,
        reminders: remindersData,
      }),
    };
  } catch (error) {
    console.error("Error in reminders handler:", error.message);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "error",
        timestamp: new Date().toISOString(),
        authenticated: false,
        error: error.message,
        clients: clients,
      }),
    };
  }
};
