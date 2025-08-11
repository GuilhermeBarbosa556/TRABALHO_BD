const express = require('express');
const { 
  obterTodosAlunos,
  obterAlunoPorId,
  criarAluno,
  atualizarAluno,
  excluirAluno
} = require('../controladores/alunoControlador');

const router = express.Router();

router.route('/')
  .get(obterTodosAlunos)
  .post(criarAluno);

router.route('/:id')
  .get(obterAlunoPorId)
  .put(atualizarAluno)
  .delete(excluirAluno);

module.exports = router;