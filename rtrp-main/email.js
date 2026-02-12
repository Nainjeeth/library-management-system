const mysql = require('mysql2');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "newuser",
  password: "azdpk7371A",
  database: "nodejs"
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or any other email service you use
  auth: {
    user: 'librarymock@gmail.com',
     pass: 'miea feut zmch nsai'
  }
});

// Function to send email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'librarymock@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error while sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};

// Function to check and send renewal reminders
const checkRenewalDates = () => {
  const query = `
    SELECT 
    l.email,
    l.stu_name,
    b.title,
    b.renewal_date
FROM 
    loginuser l
INNER JOIN 
    books b ON l.user_id = b.user_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return;
    }

    results.forEach(row => {
      const subject = `Book Renewal Reminder: ${row.title}`;
      const text = `Dear ${row.stu_name},\n\nThis is a reminder that your book "${row.title}" is due for renewal on ${row.renewal_date}.\n\nThank you,\nLibrary`;

      sendEmail(row.email, subject, text);
    });
  });
};

// Schedule the task to run daily at 7:30 PM
cron.schedule('33 11 * * *', () => {
  console.log('Running the cron job to check renewal dates');
  checkRenewalDates();
});
