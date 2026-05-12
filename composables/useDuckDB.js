let dbInstance = null
let initPromise = null

async function initDB() {
  if (dbInstance) return dbInstance

  if (initPromise) return initPromise

  initPromise = (async () => {
    const duckdb = await import('@duckdb/duckdb-wasm')
    const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles())

    // Blob URL workaround for cross-origin Worker restriction:
    // Browsers block new Worker("https://cdn.jsdelivr.net/...") from localhost.
    // Creating a same-origin Blob that uses importScripts() to load the CDN script.
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    )
    const worker = new Worker(workerUrl)

    const logger = new duckdb.ConsoleLogger()
    const db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule)

    dbInstance = db
    return db
  })()

  return initPromise
}

const PARQUET_BASE = 'https://epilepsy-parquet-metadata.s3.us-east-1.amazonaws.com'

export function useDuckDB() {
  /**
   * Run a raw SQL query. Use read_parquet() directly or table aliases.
   * @param {string} sql - SQL query using read_parquet('url') or table aliases
   * @returns {Promise<Array<Object>>} - Array of row objects
   */
  async function queryRaw(sql) {
    const db = await initDB()
    const conn = await db.connect()

    try {
      const result = await conn.query(sql)
      return result.toArray().map((row) => row.toJSON())
    } finally {
      await conn.close()
    }
  }

  /**
   * Run a SQL query against a single parquet file.
   * @param {string} parquetUrl - URL to the parquet file (e.g. '/data/penn_cnt_records/pennepi_person.parquet')
   * @param {string} sql - SQL query. Use 'data' as the table name.
   * @returns {Promise<Array<Object>>} - Array of row objects
   */
  async function query(parquetUrl, sql) {
    return queryRaw(
      sql.replace(/\bdata\b/g, `read_parquet('${parquetUrl}')`)
    )
  }

  /**
   * Helper to get a read_parquet() reference for a file in the default parquet directory.
   * @param {string} filename - e.g. 'pennepi_person.parquet'
   * @returns {string} - e.g. "read_parquet('/data/penn_cnt_records/pennepi_person.parquet')"
   */
  function table(filename) {
    return `read_parquet('${PARQUET_BASE}/${filename}')`
  }

  /**
   * Get the schema (column names and types) of a parquet file.
   * @param {string} parquetUrl
   * @returns {Promise<Array<{name: string, type: string}>>}
   */
  async function getSchema(parquetUrl) {
    const db = await initDB()
    const conn = await db.connect()

    try {
      const result = await conn.query(
        `DESCRIBE SELECT * FROM read_parquet('${parquetUrl}')`
      )
      return result.toArray().map((row) => {
        const r = row.toJSON()
        return { name: r.column_name, type: r.column_type }
      })
    } finally {
      await conn.close()
    }
  }

  return { query, queryRaw, table, getSchema }
}
