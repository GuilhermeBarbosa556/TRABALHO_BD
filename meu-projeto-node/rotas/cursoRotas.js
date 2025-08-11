const express = require('express');
const router = express.Router();
const {
  criarCurso,
  listarCursos,
  obterCursoPorId,
  atualizarCurso,
  excluirCurso
} = require('../controladores/cursoControlador');
const {
  vincularInstrutorCurso,
  desvincularInstrutorCurso
} = require('../controladores/vinculacaoControlador');

router.route('/')
  .post(criarCurso)
  .get(listarCursos);

router.route('/:id')
  .get(obterCursoPorId)
  .put(atualizarCurso)
  .delete(excluirCurso);

router.post('/vincular-instrutor', vincularInstrutorCurso);
router.post('/desvincular-instrutor', desvincularInstrutorCurso);

module.exports = router;