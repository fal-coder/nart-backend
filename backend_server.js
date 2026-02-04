const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
console.log("POST /contact reçu :", name, email, message);

  try {
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "Nouveau message - Site NART",
      text: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`
    });
    console.log("Email envoyé avec succès");
    res.json({ message: "Message envoyé avec succès !" });
  } catch (error) {
  console.error("Erreur Nodemailer :", error);
    res.status(500).json({ message: "Erreur lors de l'envoi." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Serveur lancé sur le port " + PORT));
