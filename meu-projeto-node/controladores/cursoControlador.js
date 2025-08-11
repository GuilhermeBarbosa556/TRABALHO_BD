const Curso = require('../modelos/cursoModelo');

const responder = (res, data, status = 200) => res.status(status).json(data);
const erro = (res, msg, status = 500) => responder(res, { error: msg }, status);

const validarCurso = (dados) => {
  if (!dados.nome || !dados.descricao) throw new Error('Nome e descrição são obrigatórios');
  return {
    nome: dados.nome,
    descricao: dados.descricao,
    codigo: dados.codigo,
    carga_horaria: dados.carga_horaria || 40,
    categoria: dados.categoria || 'Geral',
    nivel: dados.nivel
  };
};

exports.criarCurso = async (req, res) => {
  try {
    const curso = validarCurso(req.body);
    const { insertedId } = await Curso.criar(curso);
    responder(res, { message: 'Curso criado com sucesso', cursoId: insertedId }, 201);
  } catch (error) {
    erro(res, error.message, error.message.includes('obrigatórios') ? 400 : 500);
  }
};

exports.listarCursos = async (req, res) => {
  try {
    responder(res, await Curso.buscarTodos());
  } catch (error) {
    erro(res, error.message);
  }
};

exports.obterCursoPorId = async (req, res) => {
  try {
    const curso = await Curso.buscarPorId(req.params.id);
    curso ? responder(res, curso) : erro(res, 'Curso não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};

exports.atualizarCurso = async (req, res) => {
  try {
    const { matchedCount } = await Curso.atualizar(req.params.id, req.body);
    matchedCount ? responder(res, { message: 'Curso atualizado com sucesso' })
                : erro(res, 'Curso não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};

exports.excluirCurso = async (req, res) => {
  try {
    const { deletedCount } = await Curso.excluir(req.params.id);
    deletedCount ? responder(res, { message: 'Curso excluído com sucesso' })
                : erro(res, 'Curso não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};