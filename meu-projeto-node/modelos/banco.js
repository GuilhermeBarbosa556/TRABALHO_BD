const { MongoClient } = require('mongodb');

const conexao = "mongodb+srv://guilhermebarbosa556:guilhermebarbosa556@cluster0.p9c9gie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const nome_banco = "gestao_de_cursos";
const cliente = new MongoClient(conexao);

let bancoDados;

async function conectar() {
  try {
    if (!bancoDados) {
      await cliente.connect();
      bancoDados = cliente.db(nome_banco);
      console.log("Conectado ao MongoDB Atlas");
    }
    return bancoDados;
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}

function getBanco() {
  if (!bancoDados) {
    throw new Error("Chame connect() primeiro!");
  }
  return bancoDados;
}

module.exports = { conectar, getBanco };