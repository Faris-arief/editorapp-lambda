require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
const templateId = "HX95ef541de146404ce29cb5228ddee000"; // Example template SID

const client = twilio(accountSid, authToken);

//TEMPALTE VARS EXAMPLE = {"1":"John","2":"123"}
async function sendWhatsAppMessage(to, templateVars = null) {
  try {
    const messageOptions = {
      from: fromNumber,
      to: `whatsapp:${to}`,
    };

    messageOptions.contentSid = templateId;
    if (templateVars) {
      messageOptions.contentVariables = JSON.stringify(templateVars);
    }

    const response = await client.messages.create(messageOptions);

    console.log("Message sent successfully!");
    console.log("Message SID:", response.sid);
    console.log("Status:", response.status);
    return response;
  } catch (error) {
    console.error("Failed to send message:", error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsAppMessage,
};
