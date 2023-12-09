require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getChatCompletion } = require('./chatbot');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cors());


mongoose.connect('mongodb+srv://admin:secretclinic@secretclinic.6awg3xw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


const appointmentSchema = new mongoose.Schema({
  firstname: String,
  lastname: String, 
  email: String,
  phoneNumber: String,
  department: String,
  date: Date,
});

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/appointments', async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phoneNumber,
    department,
    date,
  } = req.body;

  try {
    const newAppointment = new AppointmentModel({
      firstname,
      lastname,
      email,
      phoneNumber,
      department,
      date,
    });

    const result = await newAppointment.save();

    console.log(result)
    res.status(201).json({ message: 'Appointment created successfully' });

  } catch (error) {
    console.error('Error saving appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/chat', getChatCompletion);

app.post('/contact', async (req, res) => {
  const { firstname, lastname, email, phoneNumber, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nattamon.tmc@gmail.com',
      pass: 'ruyoizdhduhcwzau',
    },
  });

  const mailOptions = {
    from: email,
    to: 'nattamon.tmc@gmail.com',
    subject: 'Contact Support',
    text: `
      Name: ${firstname} ${lastname}
      Email: ${email}
      Phone Number: ${phoneNumber}
      Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
