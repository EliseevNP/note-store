class ClientError extends Error {
  constructor(message = 'Internal Server Error', status = 500) {
    super(message)
    this.status = status
  }
}

export default ClientError
