const router = require('express').Router();
const { criarMatricula, listarMatriculas, atualizarMatricula } = require('../controladores/matriculaControlador');

router.route('/')
  .post(criarMatricula)
  .get(listarMatriculas);

router.patch('/:id', atualizarMatricula);

module.exports = router;