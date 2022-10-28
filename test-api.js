const axios = require('axios');
const { apiToken } = require('./config.json');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

axios
  // TEAM
  // Get Raids Info
  .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR/capitalraidseasons?limit=1', myConfig)
  // Get TeamInfo
  // .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR', myConfig)
  // Get Team Members
  // .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR/members', myConfig)
  // Get WarLeague Group
  // .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR/currentwar/leaguegroup', myConfig)
  // Get WarLeague War
  // .get('https://api.clashofclans.com/v1/clanwarleagues/wars/%232VVV0L9G9', myConfig)
  // Get Team WarLog
  // .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR/warlog?limit=5', myConfig)
  // Search Teams
  // .get('https://api.clashofclans.com/v1/clans', myConfig)
  // Get CurrentWar
  // .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR/currentwar', myConfig)
  // PLAYER
  // Get Player Info
  // .get('https://api.clashofclans.com/v1/players/%232PRJVLY29', myConfig)
  .then(res => {
    console.log(`statusCode: ${res.status}`);
    console.log(res.data);
  })
  .catch(error => {
    console.error(error);
  });