const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Habilitar CORS para todas as rotas
app.use(cors());

// Conectar ao MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'mydatabase',
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL: ', err);
    return;
  }
  console.log('Conectado ao MySQL');
});

// Criar tabela se não existir
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
  )
`;
connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('Erro ao criar tabela: ', err);
  } else {
    console.log('Tabela criada ou já existe');
  }
});

// Configurar o transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marcosdelgadinho@gmail.com',
    pass: 'wnuc ituc rtfs zusx',
  },
});

// Rota para lidar com o envio do formulário
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Verificar se o e-mail já existe
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).send(err.toString());
    }

    if (results.length > 0) {
      return res.status(400).send('Email já está cadastrado.');
    }

    // Salvar o usuário no banco de dados
    const insertQuery = 'INSERT INTO users (name, email) VALUES (?, ?)';
    connection.query(insertQuery, [name, email], (err, results) => {
      if (err) {
        return res.status(500).send(err.toString());
      }

      // Configurar o e-mail com HTML
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Matheus Araújo - Neuropsicologia e avaliação psicológica',
        html: `
          <!DOCTYPE html>
          <html lang="pt-br">

          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>

          <body>
              <div 
                  style=" font-family: 'Georgia', 'Times New Roman', Times, serif;
                  color: #333;
                  background-color: #ffffff;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;">
                  <h1>Obrigado por contactar!</h1>

                  <P>Olá,</P>
                  <p>Agradeço por entrar em contato com nossos serviços. 
                  Estou aqui para ajudar e farei o possível para atender às suas necessidades.</p>

                  <p>Se precisar de mais ajuda, não hesite em me contactar pelo Whatsapp ou Instagram:</p>
                
                  <div style="display:block;">

                  <ul style="list-style-type: none; padding: 0;">
                      <li style="margin-bottom: 10px;">
                          <a style="text-decoration: none;color: inherit; background-color: green; border-radius: 5px; color: white; padding: 5px 5px;" href="https://wa.me/558488279253" class="contact-icons">
                          WhatsApp
                          </a>
                      </li>

                      <li>
                          <a style="text-decoration: none;color: inherit; background-color: deeppink; border-radius: 5px; color: white; padding: 5px 5px;" href="https://www.instagram.com/psicologomatheusaraujo" class="contact-icons">
                          Instagram
                          </a>
                      </li>
                  </ul>

                  <p style="margin-top: 30px;">Estou à disposição para qualquer dúvida ou suporte adicional.</p>

                  <p style="margin-bottom: 0;">Atenciosamente,</p>
                  <p style="margin-top: 0;">Equipe Matheus Araújo.</p>
                    
                      
                  </div>
              </div>
              
          </body>
        `,
      };

      // Enviar o e-mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }
        res.status(200).send('Email enviado: ' + info.response);
      });
    });
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
