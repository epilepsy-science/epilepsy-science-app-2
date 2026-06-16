import { ref } from 'vue'

const SEX_MALE_COLOR = '#5b8fe8'
const SEX_FEMALE_COLOR = '#4a2d9c'

const EMPTY_SEX_BREAKDOWN = {
  totalCount: 0,
  segments: [],
  sourceLabel: 'person table',
}

const EMPTY_AGE_BREAKDOWN = {
  totalCount: 0,
  binCounts: [],
  medianAge: null,
  q1Age: null,
  q3Age: null,
  minAge: null,
  maxAge: null,
}

const DEFAULT_STATS = {
  patients: '-',
  ieegRecordings: '-',
  sexBreakdown: EMPTY_SEX_BREAKDOWN,
  ageAtIeegImplant: EMPTY_AGE_BREAKDOWN,
  mriLesionBreakdown: '-',
  fiveSenseScore: '-',
  ieegFocalityBreakdown: '-',
  interventionTypeBreakdown: '-',
}

export function useEpilepsyStats() {
  const stats = ref({ ...DEFAULT_STATS })

  async function fetchStats() {
    const { queryRaw, table } = useDuckDB()

    const [
      patientCountRows,
      ieegCountRows,
      sexRows,
      ageRows,
      mriLesionRows,
      fiveSenseRows,
      ieegFocalityRows,
      interventionTypeRows,
    ] = await Promise.all([
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
        SELECT MAX(CAST(age_ieegimplant AS DOUBLE)) AS age
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
        WHERE age_ieegimplant IS NOT NULL AND TRIM(age_ieegimplant) != ''
        GROUP BY person_id
      `),
      queryRaw(`
        SELECT LOWER(TRIM(mri_lesion)) AS mri_lesion, COUNT(DISTINCT person_id) AS count
        FROM ${table('pennepi_mri.parquet')}
        WHERE mri_lesion IS NOT NULL AND TRIM(mri_lesion) != ''
        GROUP BY LOWER(TRIM(mri_lesion))
      `),
      queryRaw(`
        SELECT
          MEDIAN(CAST(fivesensescore AS DOUBLE)) AS median_score,
          MIN(CAST(fivesensescore AS DOUBLE)) AS min_score,
          MAX(CAST(fivesensescore AS DOUBLE)) AS max_score
        FROM ${table('pennepi_5sense.parquet')}
        WHERE fivesensescore IS NOT NULL AND TRIM(fivesensescore) != ''
      `),
      queryRaw(`
        SELECT LOWER(TRIM(ieeg_isfocal)) AS ieeg_isfocal, COUNT(DISTINCT person_id) AS count
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
        WHERE ieeg_isfocal IS NOT NULL AND TRIM(ieeg_isfocal) != ''
        GROUP BY LOWER(TRIM(ieeg_isfocal))
      `),
      queryRaw(`
        SELECT intervention_type, COUNT(DISTINCT person_id) AS count
        FROM ${table('pennepi_intervention.parquet')}
        WHERE intervention_type IS NOT NULL AND TRIM(intervention_type) != ''
        GROUP BY intervention_type
        ORDER BY count DESC
      `),
    ])

    stats.value = {
      patients: formatCount(patientCountRows),
      ieegRecordings: formatCount(ieegCountRows),
      sexBreakdown: buildSexBreakdown(sexRows),
      ageAtIeegImplant: buildAgeBreakdown(ageRows),
      mriLesionBreakdown: formatBinaryBreakdown(mriLesionRows, 'mri_lesion', [
        { matchValue: 'lesional', displayLabel: 'Lesional' },
        { matchValue: 'nonlesional', displayLabel: 'Nonlesional' },
      ]),
      fiveSenseScore: formatScoreRange(fiveSenseRows[0]),
      ieegFocalityBreakdown: formatBinaryBreakdown(ieegFocalityRows, 'ieeg_isfocal', [
        { matchValue: 'focal', displayLabel: 'Focal' },
        { matchValue: 'nonfocal', displayLabel: 'Nonfocal' },
      ]),
      interventionTypeBreakdown: formatCategoryBreakdown(interventionTypeRows, 'intervention_type'),
    }
  }

  return { stats, fetchStats }
}

function formatCount(rows) {
  return rows[0]?.total != null ? String(rows[0].total) : '-'
}

function buildSexBreakdown(rows) {
  const countsBySex = Object.fromEntries(rows.map((row) => [row.sex, Number(row.count)]))
  const maleCount = countsBySex.Male ?? 0
  const femaleCount = countsBySex.Female ?? 0
  const totalCount = maleCount + femaleCount
  if (totalCount === 0) return EMPTY_SEX_BREAKDOWN
  return {
    totalCount,
    sourceLabel: 'person table',
    segments: [
      {
        label: 'Male',
        count: maleCount,
        percent: Math.round((maleCount / totalCount) * 100),
        color: SEX_MALE_COLOR,
      },
      {
        label: 'Female',
        count: femaleCount,
        percent: Math.round((femaleCount / totalCount) * 100),
        color: SEX_FEMALE_COLOR,
      },
    ],
  }
}

const AGE_HISTOGRAM_BIN_COUNT = 8

function buildAgeBreakdown(rows) {
  const agesAtImplant = rows
    .map((row) => Number(row.age))
    .filter((age) => Number.isFinite(age))
    .sort((a, b) => a - b)

  if (agesAtImplant.length === 0) return EMPTY_AGE_BREAKDOWN

  const totalCount = agesAtImplant.length
  const minAge = agesAtImplant[0]
  const maxAge = agesAtImplant[totalCount - 1]
  const medianAge = computePercentile(agesAtImplant, 0.5)
  const q1Age = computePercentile(agesAtImplant, 0.25)
  const q3Age = computePercentile(agesAtImplant, 0.75)
  const binCounts = computeHistogramBinCounts(agesAtImplant, minAge, maxAge, AGE_HISTOGRAM_BIN_COUNT)

  return { totalCount, minAge, maxAge, medianAge, q1Age, q3Age, binCounts }
}

function computePercentile(sortedValues, fraction) {
  if (sortedValues.length === 0) return null
  const positionIndex = (sortedValues.length - 1) * fraction
  const lowerIndex = Math.floor(positionIndex)
  const upperIndex = Math.ceil(positionIndex)
  if (lowerIndex === upperIndex) return sortedValues[lowerIndex]
  const interpolationWeight = positionIndex - lowerIndex
  return (
    sortedValues[lowerIndex] * (1 - interpolationWeight) +
    sortedValues[upperIndex] * interpolationWeight
  )
}

function computeHistogramBinCounts(sortedValues, minValue, maxValue, binCount) {
  const binCounts = Array.from({ length: binCount }, () => 0)
  const valueRange = maxValue - minValue
  if (valueRange === 0) {
    binCounts[Math.floor(binCount / 2)] = sortedValues.length
    return binCounts
  }
  const binWidth = valueRange / binCount
  for (const value of sortedValues) {
    const rawBinIndex = Math.floor((value - minValue) / binWidth)
    const clampedBinIndex = Math.min(Math.max(rawBinIndex, 0), binCount - 1)
    binCounts[clampedBinIndex]++
  }
  return binCounts
}

function formatScoreRange(row) {
  if (!row || row.median_score == null) return '-'
  const medianScore = Number(row.median_score).toFixed(2)
  const minScore = Number(row.min_score).toFixed(2)
  const maxScore = Number(row.max_score).toFixed(2)
  return `Median ${medianScore} (range ${minScore}–${maxScore})`
}

function formatBinaryBreakdown(rows, categoryColumn, categoryConfigs) {
  const countsByCategory = Object.fromEntries(
    rows.map((row) => [String(row[categoryColumn] ?? '').toLowerCase(), Number(row.count)])
  )
  const totalCount = categoryConfigs.reduce(
    (runningSum, { matchValue }) => runningSum + (countsByCategory[matchValue] ?? 0),
    0,
  )
  if (totalCount === 0) return '-'
  return categoryConfigs
    .map(({ matchValue, displayLabel }) => {
      const categoryCount = countsByCategory[matchValue] ?? 0
      const categoryPercent = Math.round((categoryCount / totalCount) * 100)
      return `${displayLabel}: ${categoryCount} (${categoryPercent}%)`
    })
    .join(' · ')
}

function formatCategoryBreakdown(rows, categoryColumn, maxCategoriesShown = 3) {
  if (!rows.length) return '-'
  const totalCount = rows.reduce((runningSum, row) => runningSum + Number(row.count), 0)
  if (totalCount === 0) return '-'
  const topCategories = rows.slice(0, maxCategoriesShown)
  const formattedTopCategories = topCategories.map((row) => {
    const categoryCount = Number(row.count)
    const categoryPercent = Math.round((categoryCount / totalCount) * 100)
    return `${row[categoryColumn]}: ${categoryCount} (${categoryPercent}%)`
  })
  const remainingCategoryCount = rows.length - topCategories.length
  if (remainingCategoryCount > 0) {
    formattedTopCategories.push(`+${remainingCategoryCount} more`)
  }
  return formattedTopCategories.join(' · ')
}
