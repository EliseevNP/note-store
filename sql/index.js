import setupDatabaseScheme from './setup-database-scheme'

setupDatabaseScheme()
  .then(() => {
    console.log('Database scheme created')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
