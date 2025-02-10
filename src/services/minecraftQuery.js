const { status } = require('minecraft-server-util');

exports.queryServer = async (serverIP, serverPort) => {
  try {
    const response = await status(serverIP, serverPort);

    const serverInfo = {
      motd: {
        clean: response.motd.clean,
        raw: response.motd.raw,
        html: response.motd.html,
      },
      version: {
        name: response.version.name,
        protocol: response.version.protocol,
      },
      players: {
        online: response.players.online,
        max: response.players.max,
        sample: response.players.sample || [],
      },
      ping: response.roundTripLatency,
      favicon: response.favicon || null, 
    };

    return serverInfo; 
  } catch (error) {
    return { error: 'An error occurred while querying the server', details: error.message };
  }
};
