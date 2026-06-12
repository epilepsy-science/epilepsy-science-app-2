import { ref } from 'vue'

const MODALITY_TABLES = [
  { key: 'ieeg',            label: 'iEEG',             parquetFilename: 'pennepi_ieeg_recording_parameters.parquet' },
  { key: 'surgicalOutcome', label: 'Surgical outcome', parquetFilename: 'pennepi_intervention.parquet' },
  { key: 'mri',             label: 'MRI',              parquetFilename: 'pennepi_mri.parquet' },
  { key: 'fiveSense',       label: '5-SENSE',          parquetFilename: 'pennepi_5sense.parquet' },
]

export function useModalityCoverage() {
  const modalityCoverage = ref(
    MODALITY_TABLES.map(({ key, label }) => ({ key, label, coveredPatientCount: 0, coveragePercent: 0 }))
  )
  const totalPatientCount = ref(0)
  const isLoading = ref(false)

  async function fetchModalityCoverage() {
    isLoading.value = true
    try {
      const { queryRaw, table } = useDuckDB()

      const totalPatientsPromise = queryRaw(`
        SELECT COUNT(DISTINCT person_id) AS total
        FROM ${table('pennepi_person.parquet')}
      `)
      const modalityCoveragePromises = MODALITY_TABLES.map(({ parquetFilename }) =>
        queryRaw(`
          SELECT COUNT(DISTINCT person_id) AS covered
          FROM ${table(parquetFilename)}
        `)
      )

      const [totalPatientRows, ...modalityRowsByIndex] = await Promise.all([
        totalPatientsPromise,
        ...modalityCoveragePromises,
      ])

      const totalPatients = Number(totalPatientRows[0]?.total ?? 0)
      totalPatientCount.value = totalPatients

      modalityCoverage.value = MODALITY_TABLES.map(({ key, label }, modalityIndex) => {
        const coveredPatientCount = Number(modalityRowsByIndex[modalityIndex][0]?.covered ?? 0)
        const coveragePercent =
          totalPatients > 0 ? Math.round((coveredPatientCount / totalPatients) * 100) : 0
        return { key, label, coveredPatientCount, coveragePercent }
      })
    } finally {
      isLoading.value = false
    }
  }

  return { modalityCoverage, totalPatientCount, isLoading, fetchModalityCoverage }
}
