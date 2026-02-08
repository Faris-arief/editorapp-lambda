require("dotenv").config();
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

    // Get reminders for each client
    const remindersData = {};

    for (const client of clients) {
      try {
        console.log(`Fetching reminders for client: ${client}`);

        const bookingResponse = await apiService.request(
          `${process.env.API_BASE_URL}/${client}/bookings/remindersAvailable`,
          {
            method: "GET",
          },
        );

        const settingsResponse = await apiService.request(
          `${process.env.API_BASE_URL}/${client}/settings`,
          {
            method: "GET",
          },
        );

        const settingList = settingsResponse.data.data || [];


        const timeZone = settingList.find(x=> x.id === "timeZone")?.value || "Asia/Kuala_Lumpur";
        const salonName = settingList.find(x=> x.id === "salonName")?.value || "The Editor Salon";
        const phoneNumber = settingList.find(x=> x.id === "phoneNumber")?.value ?? "";
        const walkInContactId = Number(settingList.find(x=> x.id === "walkInContactId")?.value ?? "-1");


        const bookingList = bookingResponse.data.data || [];
        const bookingMap = {};

        bookingList.forEach((booking) => {
          if (bookingMap[booking.customerId]) {
            bookingMap[booking.customerId].push(booking);
          } else {
            bookingMap[booking.customerId] = [booking];
          }
        });

        const promisesToBeDone = Object.keys(bookingMap).map(async x=> {
          const bookings = bookingMap[x];
          const requestBody = {};
          const bookingCount = bookings.length;
          if(bookingCount){
            requestBody[1] = `${bookings[0].name}${bookingCount > 1 ? ` (${bookingCount} pax)` : ""}`;
          }

          const dateArray = [];
          const contactArray = [];

          bookings.forEach(booking => {
            const personInCharge = ((booking.isWalkIn && !booking.contactId) || (booking.contactId === walkInContactId)) ? (booking.stylistPreference ?? "No Stylist Preference") : booking.contact.name;
            const bookingTime = moment.utc(booking.date).tz(timeZone);
            const formattedDate = bookingTime.format("DD/MM/YYYY h:mm A");
            contactArray.push(personInCharge);
            dateArray.push(formattedDate);
          });

          const distinctDates = [...new Set(dateArray)];
          const distinctContacts = [...new Set(contactArray)];
          const dateTemplate = `${distinctDates.join(" and ")}`;
          const contactTemplate = `${distinctContacts.join(" and ")}`;

          const phoneNumberToUse = bookings[0].phoneNumber.startsWith("0") ? `+6${bookings[0].phoneNumber}` : `+${bookings[0].phoneNumber}`;
          requestBody[2] = salonName;
          requestBody[3] = dateTemplate;
          requestBody[4] = contactTemplate;
          requestBody[5] = phoneNumber;
          await sendWhatsAppMessage(phoneNumberToUse, requestBody);
        });

        await Promise.all(promisesToBeDone);

        const response = await apiService.request(
          `${process.env.API_BASE_URL}/${client}/bookings/updateReminderSent`,
          {
            method: "PATCH",
            body: {
              bookingList: bookingList.map(x=> x.id),
            },
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

    // Check if any client had errors
    const hasErrors = Object.values(remindersData).some(r => r.success === false);

    if (hasErrors) {
      throw new Error("One or more clients failed to process reminders");
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
    throw error;
  }
};
