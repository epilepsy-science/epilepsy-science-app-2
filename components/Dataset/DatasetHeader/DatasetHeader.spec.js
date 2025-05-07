import { shallowMount, createLocalVue } from '@vue/test-utils'
import DatasetHeader from './DatasetHeader.vue'
import { state, mutations, actions, getters } from '~/store/index.js'

const localVue = createLocalVue()


describe('DatasetHeader.vue', () => {
  let cmp
  let store
  let datasetDetails

  beforeEach(() => {
    datasetDetails = {
      size: 123,
      id: 323532,
      version: 2,
      ownerFirstName: 'Maha',
      ownerLastName: 'Zayed',
      ownerOrcid: '12-34-56',
      name: 'Dataset Name',
      description: 'This is a description',
      banner: 'img/banner.jpg',
      fileCount: '24',
      embargo: false
    }

    cmp = shallowMount(DatasetHeader, {
      propsData: {
        datasetDetails,
        datasetDescription: datasetDetails.description
      },
      stubs: ['nuxt-link', 'svg-icon'],
      store,
      localVue
    })
    cmp.setData({
      correspondingContributor: {},
      isDownloadModalVisible: false,
      isVersionModalVisible: false
    })
  })

  /** Computed */

  it('getDownloadSize()', () => {
    expect(cmp.vm.getDownloadSize).toEqual(datasetDetails.size)
  })

  it('getDatasetId()', () => {
    expect(cmp.vm.datasetId).toEqual(datasetDetails.id)
  })

  it('latestVersion()', () => {
    expect(cmp.vm.latestVersion).toEqual(datasetDetails.version)
  })

  it('datasetTitle()', () => {
    expect(cmp.vm.datasetTitle).toEqual(datasetDetails.name)
  })

  it('datasetDescription()', () => {
    expect(cmp.vm.datasetDescription).toEqual(datasetDetails.description)
  })

  it('getDatasetImage()', () => {
    expect(cmp.vm.getDatasetImage).toEqual(datasetDetails.banner)
  })

  it('datasetFiles()', () => {
    expect(cmp.vm.datasetFiles).toEqual(datasetDetails.fileCount)
  })

  /** Methods */

  it('getDataset()', () => {
    cmp.vm.getDataset()
    expect(cmp.vm.isDownloadModalVisible).toBe(true)
  })

  it('getVersionHistory()', () => {
    cmp.vm.getVersionHistory()
    expect(cmp.vm.isVersionModalVisible).toBe(true)
  })

  it('closeVersionModal()', () => {
    cmp.vm.closeVersionModal()
    expect(cmp.vm.isVersionModalVisible).toBe(false)
  })

  it('The get download button should be enabled for a public dataset', () => {
    expect(cmp.vm.isGetDatasetBtnDisabled).toBe(false)
  })

  it('The get download button should be disabled for a logged out user for an embargoed dataset', async () => {
    await cmp.setProps({
      isDatasetEmbargoed: true
    })
    expect(cmp.vm.isDatasetEmbargoed).toBe(true)
    expect(cmp.vm.isGetDatasetBtnDisabled).toBe(true)
  })

  it('The get download button should be disabled for a logged in user for an embargoed dataset', async () => {
    await cmp.setProps({
      isDatasetEmbargoed: true
    })
    await store.dispatch('updateUserToken', '123')
    expect(cmp.vm.isGetDatasetBtnDisabled).toBe(false)
  })
})
