const express = require('express');
const brevo = require('@getbrevo/brevo');
const app = express();

app.use(express.json());
app.use(express.static('public')); // ou votre dossier frontend

// Configuration API Brevo
let apiInstance = new brevo.TransactionalEmailsApi();
console.log('🔧 Configuration Brevo...');
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);
console.log('✅ Brevo configuré');

// Route de contact
app.post('/contact', async (req, res) => {
  const { nom, email, message } = req.body;
  
  console.log('POST /contact reçu :', nom, email, message);
  
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    // Utilisation des variables d'environnement
    sendSmtpEmail.sender = { 
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME
    };
    
    sendSmtpEmail.to = [{ 
      email: process.env.RECIPIENT_EMAIL
    }];
    
    // Pour pouvoir répondre directement au visiteur
    sendSmtpEmail.replyTo = {
      email: email,
      name: nom
    };
    
    sendSmtpEmail.subject = `Nouveau message de ${nom}`;
    
    sendSmtpEmail.htmlContent = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Message :</strong></p>
      <p>${message}</p>
    `;
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès à', process.env.RECIPIENT_EMAIL);
    res.json({ success: true, message: 'Message envoyé !' });
    
  } catch (error) {
    console.error('❌ Erreur API Brevo :', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi' 
    });
  }
});

// Démarrage du serveur (OBLIGATOIRE !)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});