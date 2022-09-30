const axios = require('axios');
const { apiToken } = require('./config.json');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

axios
  .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR', myConfig)
  .then(res => {
    console.log(`statusCode: ${res.status}`);
    console.log(res.data);
  })
  .catch(error => {
    console.error(error);
  });