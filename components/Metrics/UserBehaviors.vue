<template>
  <div class="p-16">
    <div class="heading2 mb-0">
      Page Views
    </div>
    <BarChart
      :chartData="pageChartData"
      :chartOptions="pageChartOptions"
    />
    <hr class="my-16"/>
    <div class="heading2 mb-0">
      User Types
    </div>
    <BarChart
      :chartData="usersChartData"
      :chartOptions="usersChartOptions"
    />
    <hr class="my-16"/>
    <div class="row">
      <div class="col">
        <div class="col-header heading2 mb-0">
          Downloads last month: <span class="col-data">{{ totalDownloadsLastMonth }}</span> <span class="body1">({{ totalDownloadsLastQuarter }} last quarter)</span>
        </div>
      </div>
      <div class="col">
        <div class="col-header heading2 mb-0">
          Dataset Contributors: <span class="col-data">{{ totalContributers }}</span> <span class="body1">({{ newContributers }} new in the last month)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { pathOr, propOr } from 'ramda'
import BarChart from '@/components/Charts/BarChart.vue'

export default {
  name: 'UserBehaviors',
  components: {
    BarChart
  },
  props: {
    metricsData: {
      type: Object,
      default: () => {}
    },
  },
  watch: {
    userBehaviors: {
      handler: function(behaviors) {
        if (!behaviors) {
          return
        }
        this.pageChartData = {
          labels: behaviors.pageViewsLabels,
          datasets: [ 
            { 
              label: 'Last Month',
              backgroundColor: [
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
              ],
              borderColor: 'rgba(131, 0, 191, .5)',
              data: behaviors.pageViewsData?.lastMonth
            },
            { 
              label: 'Last Quarter',
              backgroundColor: [
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
              ],
              borderColor: 'rgba(188, 0, 252, .25)',
              data: behaviors.pageViewsData?.last3Months
            }
          ]
        }
        this.usersChartData = {
          labels: [ 'Returning', 'New' ],
          datasets: [ 
            { 
              label: 'Last Month',
              backgroundColor: [
                'rgba(131, 0, 191, .5)',
                'rgba(131, 0, 191, .5)',
              ],
              borderColor: 'rgba(131, 0, 191, .5)',
              data: behaviors.usersData?.lastMonth
            },
            { 
              label: 'Last Quarter',
              backgroundColor: [
                'rgba(188, 0, 252, .25)',
                'rgba(188, 0, 252, .25)',
              ],
              borderColor: 'rgba(188, 0, 252, .25)',
              data: behaviors.usersData?.last3Months
            }
          ]
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      pageChartData: {},
      pageChartOptions: {
        responsive: true,
        drawOnChartArea: false,
        scales: {
          x: {
            barPercentage: 1.0,
            grid: {
              drawTicks: false,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              padding: 8,
              fontFamily: 'sans-serif',
              fontSize: 16,
              fontStyle: 'bold'
            },
          },
          y: {
            grid: {
              drawTicks: true,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              display: true,
              padding: 3,
              callback: (value, index, values) => {
                // we only want to show the greatest value tick
                if (values[values.length-1].value == value) {
                  return value
                }
              }
            },
            scaleLabel: {
              display: false,
            }
          },
        },
        plugins: {
          legend: {
            labels: {
              boxWidth: 13
            },
            position: 'right',
            align: 'start',
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
                weight: 'bold',
                size: 16
            }
          }
        }    
      },
      usersChartData: {},
      usersChartOptions: {
        responsive: true,
        drawOnChartArea: false,
        scales: {
          y: {
            grid: {
              drawTicks: true,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              display: true,
              padding: 3,
              callback: (value, index, values) => {
                // we only want to show the greatest value tick
                if (values[values.length-1].value == value) {
                  return value
                }
              }
            },
            scaleLabel: {
              display: false
            }
          },
          x: {
            barPercentage: 1.0,
            grid: {
              drawTicks: false,
              drawOnChartArea: false,
              lineWidth: 2
            },
            ticks: {
              padding: 8,
              fontFamily: 'sans-serif',
              fontSize: 16,
              fontStyle: 'bold'
            },
          }
        },
        plugins: {
          legend: {
            labels: {
              boxWidth: 13
            },
            position: 'right',
            align: 'start',
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
                weight: 'bold',
                size: 16
            }
          }
        }    
      }
    }
  },
  computed: {
    userBehaviors() {
      return propOr({}, 'userBehaviors', this.metricsData)
    },
    totalDownloadsLastMonth() {
      return pathOr('', ['totalDownloadsData', 'lastMonth'], this.userBehaviors)
    },
    totalDownloadsLastQuarter() {
      return pathOr('', ['totalDownloadsData', 'last3Months'], this.userBehaviors)
    },
    totalContributers() {
      return pathOr('', ['datasetContributorsData', 'total'], this.userBehaviors)
    },
    newContributers() {
      return pathOr('', ['datasetContributorsData', 'newLastMonth'], this.userBehaviors)
    }
  },
}

</script>
<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

hr {
  border-top: none;
  border-left: none;
  border-right: none;
  border-width: 2px;
  border-color: $lineColor1;
}

.row {
  display: flex;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}

.col {
  text-align: center;
  width: 50%;
  @media screen and (max-width: 767px) {
    width: 100%;
  }
}

.col-header {
  text-align: left;
}

.col-data {
  font-size: 2rem;
  line-height: 2.75rem;
  color: $es-primary-color;
  font-weight: bold;
}
</style>
