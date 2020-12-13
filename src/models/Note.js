import { v4 as uuidv4 } from 'uuid'
import knex from '../utils/knex'
import ClientError from '../utils/ClientError'

export default class Note {
  constructor({ userId }) {
    this.userId = userId
  }

  static findOne(where) {
    return knex('note').select().where(where).first()
  }

  async noteBelongsToUserValidation(id) {
    const note = await Note.findOne({ id })

    if (!note) {
      throw new ClientError('Note not found', 400)
    }

    if (note.userId !== this.userId) {
      throw new ClientError('Forbidden', 403)
    }
  }

  async create({ title }) {
    const [insertedRowId] = await knex('note').insert({
      userId: this.userId,
      title,
    })

    return Note.findOne({ id: insertedRowId })
  }

  async update({ id, title }) {
    await this.noteBelongsToUserValidation(id)

    await knex('note').update({ title, updatedAt: new Date() }).where({ id, userId: this.userId })

    return Note.findOne({ id, userId: this.userId })
  }

  async delete({ id }) {
    await this.noteBelongsToUserValidation(id)
    await knex('note').where('id', id).del()
  }

  async getPage({ pageSize, pageNumber }) {
    const notes = await knex('note')
      .select()
      .where('userId', this.userId)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)

    const { totalCount } = await knex('note').count('* AS totalCount').where('userId', this.userId).first()

    return {
      totalCount,
      pageSize,
      pageNumber,
      data: notes,
    }
  }

  async createLink({ id }) {
    await this.noteBelongsToUserValidation(id)

    const link = uuidv4()

    await knex('shared_link').insert({ noteId: id, link })

    return link
  }

  static async getByLink({ link }) {
    const note = await knex('shared_link AS sh')
      .select('note.title')
      .join('note', 'sh.noteId', 'note.id')
      .where('sh.link', link)
      .first()

    if (!note) {
      throw new ClientError('Note not found', 400)
    }

    return note
  }
}
