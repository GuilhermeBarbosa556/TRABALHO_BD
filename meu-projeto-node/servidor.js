const express = require('express');
const path = require('path');
const { conectar } = require('./modelos/banco');
const alunoRotas = require('./rotas/alunoRotas');
const cursoRotas = require('./rotas/cursoRotas');
const instrutorRotas = require('./rotas/instrutorRotas');
const matriculaRotas = require('./rotas/matriculaRotas');

const aplicativo = express();

aplicativo.use(express.json());
aplicativo.use(express.static(path.join(__dirname, 'publico')));

aplicativo.use('/api/alunos', alunoRotas);
aplicativo.use('/api/cursos', cursoRotas);
aplicativo.use('/api/instrutores', instrutorRotas);
aplicativo.use('/api/matriculas', matriculaRotas);

aplicativo.get('/', (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname, 'publico', 'index.html'));
});

async function iniciarServidor() {
  try {
    await conectar();
    console.log('Conectado ao MongoDB');

    aplicativo.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  } catch (error) {
    console.error('Falha ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

iniciarServidor();