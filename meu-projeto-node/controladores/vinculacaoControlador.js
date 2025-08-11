const Instrutor = require('../modelos/instrutorModelo');
const Curso = require('../modelos/cursoModelo');

const responder = (res, data, status = 200) => res.status(status).json(data);
const erro = (res, msg, status = 500) => responder(res, { error: msg }, status);

const validarIds = (id1, id2) => {
  if (!id1 || !id2) throw new Error('Instrutor e curso são obrigatórios');
};

const processarVinculo = async (res, ids, vincular = true) => {
  try {
    const { instrutorId, cursoId } = ids;
    validarIds(instrutorId, cursoId);

    const [cursoResult, instrutorResult] = await Promise.all([
      vincular 
        ? Curso.vincularInstrutor(cursoId, instrutorId)
        : Curso.desvincularInstrutor(cursoId),
      vincular
        ? Instrutor.vincularCurso(instrutorId, cursoId)
        : Instrutor.desvincularCurso(instrutorId, cursoId)
    ]);

    if (cursoResult.matchedCount > 0 && instrutorResult.matchedCount > 0) {
      responder(res, { message: `Vínculo ${vincular ? 'criado' : 'removido'} com sucesso!` });
    } else {
      erro(res, `Não foi possível ${vincular ? 'vincular' : 'desvincular'}. Verifique os IDs.`, 404);
    }
  } catch (error) {
    erro(res, error.message, error.message.includes('obrigatórios') ? 400 : 500);
  }
};

exports.vincularInstrutorCurso = (req, res) => processarVinculo(res, req.body, true);
exports.desvincularInstrutorCurso = (req, res) => processarVinculo(res, req.body, false);