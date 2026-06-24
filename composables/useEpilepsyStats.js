import { ref } from 'vue'

const PALETTE_PRIMARY_BLUE = '#297fca'
const PALETTE_SECONDARY_GREEN = '#14a758'
const PALETTE_NEUTRAL_GRAY = '#CCCCCC'

const SEX_MALE_COLOR = PALETTE_PRIMARY_BLUE
const SEX_FEMALE_COLOR = PALETTE_SECONDARY_GREEN
const MRI_LESIONAL_COLOR = PALETTE_PRIMARY_BLUE
const MRI_NONLESIONAL_COLOR = PALETTE_SECONDARY_GREEN
const MRI_UNKNOWN_COLOR = PALETTE_NEUTRAL_GRAY
const FOCAL_COLOR = PALETTE_PRIMARY_BLUE
const NONFOCAL_COLOR = PALETTE_SECONDARY_GREEN
const FOCALITY_UNKNOWN_COLOR = PALETTE_NEUTRAL_GRAY

const EMPTY_SEX_BREAKDOWN = {
  totalCount: 0,
  segments: [],
  sourceLabel: 'person table',
}

const EMPTY_AGE_BREAKDOWN = {
  totalCount: 0,
  binCounts: [],
  binStartAge: 0,
  binWidthYears: 10,
  medianAge: null,
  q1Age: null,
  q3Age: null,
  minAge: null,
  maxAge: null,
}

const EMPTY_MRI_BREAKDOWN = {
  segments: [],
  totalKnownCount: 0,
  unknownCount: 0,
  totalPatientCount: 0,
}

const EMPTY_FIVE_SENSE_BREAKDOWN = {
  binCounts: [],
  medianScore: null,
  q1Score: null,
  q3Score: null,
  totalScoredCount: 0,
  totalPatientCount: 0,
}

const EMPTY_FOCALITY_BREAKDOWN = {
  segments: [],
}

const EMPTY_INTERVENTION_BREAKDOWN = {
  categories: [],
  totalPatientCount: 0,
}

const DEFAULT_STATS = {
  patients: '-',
  ieegRecordings: '-',
  sexBreakdown: EMPTY_SEX_BREAKDOWN,
  ageAtIeegImplant: EMPTY_AGE_BREAKDOWN,
  mriLesionBreakdown: EMPTY_MRI_BREAKDOWN,
  fiveSenseScore: EMPTY_FIVE_SENSE_BREAKDOWN,
  ieegFocalityBreakdown: EMPTY_FOCALITY_BREAKDOWN,
  interventionTypeBreakdown: EMPTY_INTERVENTION_BREAKDOWN,
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
      ieegFocalityPatientRows,
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
        SELECT MAX(CAST(fivesensescore AS DOUBLE)) AS score
        FROM ${table('pennepi_5sense.parquet')}
        WHERE fivesensescore IS NOT NULL AND TRIM(fivesensescore) != ''
        GROUP BY person_id
      `),
      queryRaw(`
        SELECT LOWER(TRIM(ieeg_isfocal)) AS ieeg_isfocal, COUNT(DISTINCT person_id) AS count
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
        WHERE ieeg_isfocal IS NOT NULL AND TRIM(ieeg_isfocal) != ''
        GROUP BY LOWER(TRIM(ieeg_isfocal))
      `),
      queryRaw(`
        SELECT COUNT(DISTINCT person_id) AS total
        FROM ${table('pennepi_ieeg_recording_parameters.parquet')}
        WHERE ieeg_isfocal IS NOT NULL AND TRIM(ieeg_isfocal) != ''
      `),
      queryRaw(`
        SELECT intervention_type, COUNT(DISTINCT person_id) AS count
        FROM ${table('pennepi_intervention.parquet')}
        WHERE intervention_type IS NOT NULL AND TRIM(intervention_type) != ''
        GROUP BY intervention_type
        ORDER BY count DESC
      `),
    ])

    const mriLesionEntryRows = await queryRaw(`
      SELECT mri_lesion
      FROM ${table('pennepi_mri.parquet')}
    `)
    console.log('mri_lesion', mriLesionEntryRows.map((row) => row.mri_lesion))

    const totalPatientCount = Number(patientCountRows[0]?.total ?? 0)

    stats.value = {
      patients: formatCount(patientCountRows),
      ieegRecordings: formatCount(ieegCountRows),
      sexBreakdown: buildSexBreakdown(sexRows),
      ageAtIeegImplant: buildAgeBreakdown(ageRows),
      mriLesionBreakdown: buildMriLesionBreakdown(mriLesionRows, totalPatientCount),
      fiveSenseScore: buildFiveSenseBreakdown(fiveSenseRows, totalPatientCount),
      ieegFocalityBreakdown: buildIeegFocalityBreakdown(
        ieegFocalityRows,
        Number(ieegFocalityPatientRows[0]?.total ?? 0),
        totalPatientCount,
      ),
      interventionTypeBreakdown: buildInterventionTypeBreakdown(interventionTypeRows),
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

const AGE_HISTOGRAM_BIN_WIDTH_YEARS = 10

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
  const binStartAge = Math.floor(minAge / AGE_HISTOGRAM_BIN_WIDTH_YEARS) * AGE_HISTOGRAM_BIN_WIDTH_YEARS
  const binEndAge = Math.floor(maxAge / AGE_HISTOGRAM_BIN_WIDTH_YEARS) * AGE_HISTOGRAM_BIN_WIDTH_YEARS + AGE_HISTOGRAM_BIN_WIDTH_YEARS
  const binCount = Math.max(1, Math.round((binEndAge - binStartAge) / AGE_HISTOGRAM_BIN_WIDTH_YEARS))
  const binCounts = computeFixedWidthBinCounts(agesAtImplant, binStartAge, AGE_HISTOGRAM_BIN_WIDTH_YEARS, binCount)

  return {
    totalCount,
    minAge,
    maxAge,
    medianAge,
    q1Age,
    q3Age,
    binCounts,
    binStartAge,
    binWidthYears: AGE_HISTOGRAM_BIN_WIDTH_YEARS,
  }
}

function computeFixedWidthBinCounts(sortedValues, binStartValue, binWidth, binCount) {
  const binCounts = Array.from({ length: binCount }, () => 0)
  for (const value of sortedValues) {
    const rawBinIndex = Math.floor((value - binStartValue) / binWidth)
    const clampedBinIndex = Math.min(Math.max(rawBinIndex, 0), binCount - 1)
    binCounts[clampedBinIndex]++
  }
  return binCounts
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

function buildMriLesionBreakdown(rows, totalPatientCount) {
  if (totalPatientCount === 0) return EMPTY_MRI_BREAKDOWN
  const countsByValue = Object.fromEntries(
    rows.map((row) => [String(row.mri_lesion ?? '').toLowerCase(), Number(row.count)]),
  )
  const lesionalCount = countsByValue.lesional ?? 0
  const nonlesionalCount = countsByValue.nonlesional ?? 0
  const totalKnownCount = lesionalCount + nonlesionalCount
  const unknownCount = Math.max(totalPatientCount - totalKnownCount, 0)
  const computePercent = (count) =>
    totalPatientCount > 0 ? Math.round((count / totalPatientCount) * 100) : 0
  return {
    totalKnownCount,
    unknownCount,
    totalPatientCount,
    segments: [
      {
        label: 'Lesional',
        count: lesionalCount,
        percent: computePercent(lesionalCount),
        color: MRI_LESIONAL_COLOR,
      },
      {
        label: 'Nonlesional',
        count: nonlesionalCount,
        percent: computePercent(nonlesionalCount),
        color: MRI_NONLESIONAL_COLOR,
      },
      {
        label: 'Unknown',
        count: unknownCount,
        percent: computePercent(unknownCount),
        color: MRI_UNKNOWN_COLOR,
      },
    ],
  }
}

const FIVE_SENSE_BIN_COUNT = 10
const FIVE_SENSE_SCALE_MIN = 0
const FIVE_SENSE_SCALE_MAX = 1

function buildFiveSenseBreakdown(rows, totalPatientCount) {
  const scoreValues = rows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score))
    .sort((a, b) => a - b)

  if (scoreValues.length === 0) {
    return { ...EMPTY_FIVE_SENSE_BREAKDOWN, totalPatientCount }
  }

  return {
    totalScoredCount: scoreValues.length,
    totalPatientCount,
    medianScore: computePercentile(scoreValues, 0.5),
    q1Score: computePercentile(scoreValues, 0.25),
    q3Score: computePercentile(scoreValues, 0.75),
    binCounts: computeHistogramBinCounts(
      scoreValues,
      FIVE_SENSE_SCALE_MIN,
      FIVE_SENSE_SCALE_MAX,
      FIVE_SENSE_BIN_COUNT,
    ),
  }
}

function buildIeegFocalityBreakdown(rows, patientsWithFocalityData, totalPatientCount) {
  const countsByValue = Object.fromEntries(
    rows.map((row) => [String(row.ieeg_isfocal ?? '').toLowerCase(), Number(row.count)]),
  )
  const focalCount = countsByValue.focal ?? 0
  const nonfocalCount = countsByValue.nonfocal ?? 0
  const unknownCount = Math.max(totalPatientCount - patientsWithFocalityData, 0)
  const segmentsWithCounts = [
    { label: 'Focal', count: focalCount, color: FOCAL_COLOR },
    { label: 'Non-focal', count: nonfocalCount, color: NONFOCAL_COLOR },
    { label: 'Other', count: unknownCount, color: FOCALITY_UNKNOWN_COLOR },
  ]
  return { segments: addPercentages(segmentsWithCounts) }
}

const INTERVENTION_LABEL_OVERRIDES = {
  rns: 'Responsive neurostimulation',
  vns: 'Vagus nerve stimulation',
  dbs: 'Deep brain stimulation',
}

function formatInterventionLabel(rawLabel) {
  const trimmedLabel = rawLabel.trim()
  const normalizedKey = trimmedLabel.toLowerCase()
  if (INTERVENTION_LABEL_OVERRIDES[normalizedKey]) {
    return INTERVENTION_LABEL_OVERRIDES[normalizedKey]
  }
  return trimmedLabel.charAt(0).toUpperCase() + trimmedLabel.slice(1).toLowerCase()
}

function buildInterventionTypeBreakdown(rows) {
  const categories = rows
    .map((row) => ({
      label: formatInterventionLabel(String(row.intervention_type ?? '')),
      count: Number(row.count) || 0,
    }))
    .filter((category) => category.label !== '' && category.count > 0)
    .sort((a, b) => b.count - a.count)
  const totalPatientCount = categories.reduce(
    (runningSum, category) => runningSum + category.count,
    0,
  )
  return { categories, totalPatientCount }
}

function addPercentages(segmentsWithCounts) {
  const totalSegmentCount = segmentsWithCounts.reduce((sum, segment) => sum + segment.count, 0)
  return segmentsWithCounts.map((segment) => ({
    ...segment,
    percent:
      totalSegmentCount > 0 ? Math.round((segment.count / totalSegmentCount) * 100) : 0,
  }))
}
