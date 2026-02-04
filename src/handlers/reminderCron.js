const { sendWhatsAppMessage, ApiService } = require("../services");
const moment = require("moment-timezone");

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

        const bookingResponse = await apiService.request(
          `https://editorapp-be.fly.dev/api/${client}/bookings/remindersAvailable`,
          {
            method: "GET",
          },
        );

        const settingsResponse = await apiService.request(
          `https://editorapp-be.fly.dev/api/${client}/settings`,
          {
            method: "GET",
          },
        );

        const settingList = settingsResponse.data.data || [];


        const timeZone = settingList.find(x=> x.key === 'timeZone')?.value || 'Asia/Kuala_Lumpur';
        const salonName = settingList.find(x=> x.key === 'salonName')?.value || 'The Editor Salon';
        const phoneNumber = settingList.find(x=> x.key === 'phoneNumber')?.value ?? '';

        const bookingList = bookingResponse.data.data || [];
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
            const requestBody = {};
            const bookingCount = bookings.length;
            if(bookingCount){
              requestBody[1] = `${bookings[0].name}${bookingCount > 1 ? ` (${bookingCount})` : ''}`;
            }

            const dateArray = [];
            const contactArray = [];

            bookings.forEach(booking => {
              const personInCharge = booking.isWalkIn && !booking.contactId ? booking.stylistPreference : booking.contact.name
              const bookingTime = moment.utc(bookings[0].startTime).tz(timeZone);
              const formattedDate = bookingTime.format("DD/MM/YYYY h:mm A"); 
              contactArray.push(personInCharge)
              dateArray.push(formattedDate)
            })

            distinctDates = [...new Set(dateArray)];
            distinctContacts = [...new Set(contactArray)];
            const dateTemplate = `${distinctDates.join(' and')}`;
            const contactTemplate = `${distinctContacts.join(' and')}`;

            const phoneNumberToUse = booking.phoneNumber.startsWith('0') ? `+6${booking.phoneNumber}` : `+${booking.phoneNumber}`;
            requestBody[2] = salonName;
            requestBody[3] = dateTemplate;
            requestBody[4] = contactTemplate;
            requestBody[5] = phoneNumber;
            await sendWhatsAppMessage(phoneNumberToUse, requestBody)
        })

        await Promise.all(promisesToBeDone);

        const response = await apiService.request(
          `https://editorapp-be.fly.dev/api/${client}/bookings/updateReminderSent`,
          {
            method: "POST",
            body: {
                bookingList: bookingList.map(x=> x.id)
            }
          },
        );
        if(response.status !== 200){
            throw new Error(`Failed to update reminders as sent for client ${client}`);
        }

        console.log(`Successfully sent reminders for ${client}`);

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
