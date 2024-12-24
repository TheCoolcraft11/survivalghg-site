const { default: axios } = require('axios');

require('dotenv').config();

const webhookUrl = process.env.WEBHOOK_URL;

function sendMessage(screenshotUrl, username, server, world, coordinates , direction, biome) {
    const payload = {
        content: null,
        embeds: [
          {
            description: "**" + (username == null ?  "Unkown" : username) + "** has made a new screenshot:",
            color: null,
            fields: [
          {
            name: "\u200B",
            value: `__${server}__\n**${world}**\n${coordinates} - ${direction}\n${biome}`
          }
          ],
            timestamp: new Date().toISOString(),
            image: {
              url: screenshotUrl,
            },
          },
        ],
        username: (username == null ?  "Unkown" : username),
        avatar_url: username == null ? null : "https://minotar.net/avatar/" + username,
        attachments: [],
        thread_name: (username == null ?  "Unkown" : username),
      };
      
      
      axios
        .post(webhookUrl, payload)
        .catch((error) => {
          console.error(`Failed to send Webhook: ${error.message}`);
        });
}

module.exports = {sendMessage}