const { getBanco } = require('./banco');
const { ObjectId } = require('mongodb');

class Curso {
  static #colecao() {
    return getBanco().collection('cursos');
  }

  static #toObjectId(id) {
    return new ObjectId(id);
  }

  static async criar(dadosCurso) {
    return await this.#colecao().insertOne({
      ...dadosCurso,
      data_cadastro: new Date(),
      ativo: true
    });
  }

  static async buscarTodos() {
    try {
      return await this.#colecao().find({ ativo: true }).toArray();
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      throw error;
    }
  }

  static async buscarPorId(id) {
    return await this.#colecao().findOne({ _id: this.#toObjectId(id) });
  }

  static async buscarPorIds(ids) {
    return await this.#colecao().find({
      _id: { $in: ids.map(this.#toObjectId) },
      ativo: true
    }).toArray();
  }

  static async atualizar(id, { nome, descricao, codigo, carga_horaria, categoria, nivel }) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(id) },
      { $set: { nome, descricao, codigo, carga_horaria, categoria, nivel } }
    );
  }

  static async excluir(id) {
    return await this.#colecao().deleteOne({ _id: this.#toObjectId(id) });
  }

  static async vincularInstrutor(cursoId, instrutorId) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(cursoId) },
      { $set: { instrutor_id: this.#toObjectId(instrutorId) } }
    );
  }

  static async desvincularInstrutor(cursoId) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(cursoId) },
      { $set: { instrutor_id: null } }
    );
  }
}

module.exports = Curso;