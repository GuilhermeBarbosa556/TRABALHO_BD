const express = require('express');
const router = express.Router();
const {
  listarInstrutores,
  obterInstrutorPorId,
  criarInstrutor,
  atualizarInstrutor,
  excluirInstrutor,
  vincularCurso
} = require('../controladores/instrutorControlador');

router.route('/')
  .get(listarInstrutores)
  .post(criarInstrutor);

router.route('/:id')
  .get(obterInstrutorPorId)
  .put(atualizarInstrutor)
  .delete(excluirInstrutor);

router.post('/:instrutorId/cursos/:cursoId', vincularCurso);

module.exports = router;