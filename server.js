const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Errors that occur in our synchronous code and not handled, like a variable not declared
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

// Logs all of the env variables running in the process
// console.log(process.env);
//The output should be development
// console.log(app.get('env')); 

// Replaces the PASSWORD placeholder with the real value
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Mongoose
mongoose
  .connect(DB)
  .then(() => console.log('Connection to DB successfully done !'));

const port = 3000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}...`);
});


// Errors that occur outside of our express app like connection errors to db
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
