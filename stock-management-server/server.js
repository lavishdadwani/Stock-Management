import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import http from 'http';
import chalk from 'chalk';
import cors from 'cors';
import path from 'path';
import hbs from 'hbs';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.routes.js';
import stockRoutes from './routes/excelStock.routes.js';
import stockApiRoutes from './routes/stock.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import stockTransferRoutes from './routes/stockTransfer.routes.js';
import Response from './models/response.model.js';
import './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.response.success = function (message, data, displayMessage, code = 200, additionalData ){
  console.log(chalk.green(message));
  this.status(code).send(
    Response('success', message,data,displayMessage,code,additionalData)
  )
}

app.response.error = function (message, data, displayMessage, code, additionalData){
  console.log(chalk.red(message));
  if(data){
    console.log(chalk.red(data));
  }
  const newMessage = typeof message != "string" ? "Something went wrong" : message
  const statusCode = code && typeof code === 'number' ? code : 400
  this.status(statusCode).send(
    Response("error", newMessage, data, displayMessage, code || statusCode, additionalData)
  )
}

app.response.accessDenied = function(){
  console.log(chalk.cyan("Access Denied. Check the role of the User."));
  this.status(200).send(Response("error","Access Denied", null, null, 500))
}

app.response.unauthorized = function(message){
  console.log(chalk.yellow("Unauthorized User"));
  this.status(403).send(
    Response("Unauthorized User", message, null, null, 403)
  )
}
app.use(stockRoutes) // Old Google Sheets routes
app.use("/api/stock",stockApiRoutes) // New MongoDB stock API routes
app.use("/api/user",userRoutes)
app.use("/api/attendance",attendanceRoutes) // Attendance and check-in/check-out routes
app.use("/api/stock-transfer",stockTransferRoutes) // Stock transfer routes

app.get('/', (req, res) => {
  res.send('server is working fine');
});

app.set('view engine', 'hbs');
// app.set('view options', { layout: 'layout' });
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'MulterError') return res.status(400).send(err.message);
  res.status(500).send(err.message || 'Internal Server Error');
});

server.listen(PORT, (err) => {
  if (err) {
    console.log(chalk.red("Cannot run!"));
  } else {
    console.log(
      chalk.green.bold(
        `
        Yep, this is working 🍺
        App is listening on port: ${PORT} 🍕
        Env: ${process.env.NODE_ENV} 🦄
      `
      )
    );
  }
});
