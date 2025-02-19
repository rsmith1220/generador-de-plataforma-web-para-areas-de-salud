const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');

AWS.config.update({ region: "us-east-1" }); // Ajusta tu región
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/guardarUsuario', async (req, res) => {
  const { username, email } = req.body;

  const params = {
    TableName: "Usuarios",
    Item: { username, email },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "Usuario guardado en DynamoDB!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar usuario" });
  }
});

module.exports = app;
