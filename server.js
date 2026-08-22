const dotenv = require('dotenv');

//to read env variables from the file and save them
//to nodeJS environment vars
dotenv.config({ path: './config.env' });
// console.log(process.env);

const app = require('./app');

app.listen(8000, '127.0.0.1', () => {
  console.log('listenning...');
});
