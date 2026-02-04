const cors = require('cors');
const express = require('express');
const brevo = require('@getbrevo/brevo');
const app = express();

// ⭐ CORS - IMPORTANT : À mettre AVANT les autres app.use()
app.use(cors({
  origin: [
    'https://698369c61edf0e189b1d0665--nart-site.netlify.app',
    'https://nart-site.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

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
  
  console.log('📨 POST /contact reçu :', { nom, email, message });
  
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { 
      email: process.env.SENDER_EMAIL,
      name: 'Mon Site Web - Formulaire Contact'
    };
    
    sendSmtpEmail.to = [{ 
      email: process.env.RECIPIENT_EMAIL
    }];
    
    sendSmtpEmail.replyTo = {
      email: email,
      name: nom
    };
    
    sendSmtpEmail.subject = `[Formulaire Contact] Nouveau message de ${nom}`;
    
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            📬 Nouveau message de contact
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>👤 Nom :</strong> ${nom}</p>
            <p><strong>📧 Email :</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
          </div>
          
          <div style="background-color: #fff; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Message :</p>
            <p style="margin: 10px 0 0 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #7f8c8d;">
            Cet email provient du formulaire de contact de votre site web.<br>
            Pour répondre, cliquez simplement sur "Répondre".
          </p>
        </div>
      </body>
      </html>
    `;
    
    sendSmtpEmail.textContent = `
NOUVEAU MESSAGE DE CONTACT
==========================

Nom: ${nom}
Email: ${email}

Message:
--------
${message}

---
Cet email provient du formulaire de contact de votre site web.
Pour répondre, utilisez l'adresse: ${email}
    `;
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès !');
    res.json({ success: true, message: 'Message envoyé !' });
    
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi'
    });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
