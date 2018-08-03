<script>
import { Pie } from 'vue-chartjs'
 
export default {
  name:'piechart',
  extends: Pie,
  props: ['data'],
  mounted () {
    this.renderPieChart()
  },
  computed: {
    chartData: function() {
      return this.data;
    }
  },
  methods: {
    renderPieChart () {
      this.renderChart(
        {
          datasets: [{
              backgroundColor: ['#7580ac', '#f7a9af'],
              data: this.chartData
          }],
          labels: [
              'Boy',
              'Girl'
          ]
        },
        {
          responsive: true, 
          maintainAspectRatio: false,
          legend: {
              display: true,
              position:'bottom'
          },
          title: {
              display: true,
              text: 'Selection Ratio'
          }
        }
      );
    } 
  },
  watch: {
    data (){
      this.$data._chart.destroy();
      this.renderPieChart();
    }
  }
}
</script>

