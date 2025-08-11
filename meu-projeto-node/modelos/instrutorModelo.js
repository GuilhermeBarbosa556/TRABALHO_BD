const { getBanco } = require('./banco');
const { ObjectId } = require('mongodb');

class Instrutor {
  static #colecao() {
    return getBanco().collection('instrutores');
  }

  static #toObjectId(id) {
    return new ObjectId(id);
  }

  static #dadosInstrutor(dados) {
    return {
      nome: dados.nome,
      dataNascimento: dados.dataNascimento,
      cpf: dados.cpf,
      rg: dados.rg,
      especialidade: dados.especialidade,
      formacao: dados.formacao,
      email: dados.email,
      telefone: dados.telefone,
      endereco: {
        cep: dados.cep,
        rua: dados.rua,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado
      },
      cursos: [],
      data_cadastro: new Date(),
      ativo: true
    };
  }

  static async criar(dados) {
    return await this.#colecao().insertOne(this.#dadosInstrutor(dados));
  }

  static async buscarTodos() {
    return await this.#colecao().find().toArray();
  }

  static async buscarPorId(id) {
    return await this.#colecao().aggregate([
      { $match: { _id: this.#toObjectId(id) } },
      {
        $lookup: {
          from: 'cursos',
          localField: 'cursosVinculados',
          foreignField: '_id',
          as: 'cursosVinculados'
        }
      },
      { $limit: 1 }
    ]).next();
  }

  static async atualizar(id, dados) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(id) },
      { $set: this.#dadosInstrutor(dados) }
    );
  }

  static async excluir(id) {
    return await this.#colecao().deleteOne({ _id: this.#toObjectId(id) });
  }

  static async vincularCurso(instrutorId, cursoId) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(instrutorId) },
      { $addToSet: { cursosVinculados: this.#toObjectId(cursoId) } }
    );
  }

  static async desvincularCurso(instrutorId, cursoId) {
    return await this.#colecao().updateOne(
      { _id: this.#toObjectId(instrutorId) },
      { $pull: { cursosVinculados: this.#toObjectId(cursoId) } }
    );
  }
}

module.exports = Instrutor;