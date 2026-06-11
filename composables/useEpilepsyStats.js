import { ref } from 'vue'

const DEFAULT_STATS = {
  patients: '-',
  ieegRecordings: '-',
  sexBreakdown: '-',
  ageAtIeegImplant: '-',
}

export function useEpilepsyStats() {
  const stats = ref({ ...DEFAULT_STATS })

  async function fetchStats() {
    const { queryRaw, table } = useDuckDB()

    const [patientCountRows, ieegCountRows, sexRows, ageRows] = await Promise.all([
      queryRaw(`
        SELECT COUNT(DISTINCT person_id) AS total
        FROM ${table('pennepi_person.parquet')}
      `),
      queryRaw(`
        SELECT COUNT(DISTINCT (person_id, session_id, scans_filename)) AS total
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
      `),
      queryRaw(`
        SELECT sex, COUNT(*) AS count
        FROM ${table('pennepi_person.parquet')}
        WHERE sex IS NOT NULL AND TRIM(sex) != ''
        GROUP BY sex
      `),
      queryRaw(`
        SELECT
          MEDIAN(CAST(age_ieegimplant AS DOUBLE)) AS median_age,
          MIN(CAST(age_ieegimplant AS DOUBLE)) AS min_age,
          MAX(CAST(age_ieegimplant AS DOUBLE)) AS max_age
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
        WHERE age_ieegimplant IS NOT NULL AND TRIM(age_ieegimplant) != ''
      `),
    ])

    stats.value = {
      patients: formatCount(patientCountRows),
      ieegRecordings: formatCount(ieegCountRows),
      sexBreakdown: formatSexBreakdown(sexRows),
      ageAtIeegImplant: formatAgeRange(ageRows[0]),
    }
  }

  return { stats, fetchStats }
}

function formatCount(rows) {
  return rows[0]?.total != null ? String(rows[0].total) : '-'
}

function formatSexBreakdown(rows) {
  const countsBySex = Object.fromEntries(rows.map((row) => [row.sex, Number(row.count)]))
  const maleCount = countsBySex.Male ?? 0
  const femaleCount = countsBySex.Female ?? 0
  const totalCount = maleCount + femaleCount
  if (totalCount === 0) return '-'
  const malePercent = Math.round((maleCount / totalCount) * 100)
  const femalePercent = Math.round((femaleCount / totalCount) * 100)
  return `M: ${maleCount} (${malePercent}%) · F: ${femaleCount} (${femalePercent}%)`
}

function formatAgeRange(row) {
  if (!row || row.median_age == null) return '-'
  const medianAge = Math.round(Number(row.median_age))
  const minAge = Math.round(Number(row.min_age))
  const maxAge = Math.round(Number(row.max_age))
  return `Median ${medianAge} (range ${minAge}–${maxAge})`
}
