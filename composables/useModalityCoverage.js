import { ref } from 'vue'

const MODALITY_TABLES = [
  { key: 'mri',             label: 'Magnetic Resonance Imaging',                parquetFilename: 'pennepi_mri.parquet' },
  { key: 'ieeg',            label: 'Intracranial Electroencephalography',       parquetFilename: 'pennepi_ieeg_recording_parameters.parquet' },
  { key: 'fiveSense',       label: 'Phenotypic and Assessment Data: 5-SENSE',   parquetFilename: 'pennepi_5sense.parquet' },
  { key: 'surgicalOutcome', label: 'Surgical Outcome Assessment Data: Engel',   parquetFilename: 'pennepi_intervention.parquet' },
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
