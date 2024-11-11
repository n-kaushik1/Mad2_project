export default {
    name: 'AdminServiceRequests',
    template: `
    <div class="admin">
    <div class="dashboard">
    <div class="section">
    <h3 class="mt-5">Service Requests Summary</h3>
    <canvas id="serviceRequestsChart"></canvas>
  </div>
      <div class="section">
        <h3>Overall Customer Ratings</h3>
        <canvas id="customerRatingsChart"></canvas>
      </div>
      
    </div>  
    </div>  
    `,
    data() {
      return {
        serviceRequestsChart: null,
        customerRatingsChart: null,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    },
    mounted() {
      this.$store.dispatch('fetchAdminServiceRequests').then(() => {
        this.calculateRatingDistribution();
        this.renderCustomerRatingsChart();
        this.renderServiceRequestsChart();
      });
    },
    methods: {
      calculateRatingDistribution() {
        this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
        this.$store.state.serviceRequests.forEach(request => {
          const rating = request.rating;
          if (rating >= 1 && rating <= 5) {
            this.ratingDistribution[rating] += 1;
          }
        });
      },
      
      renderCustomerRatingsChart() {
        const ctx = document.getElementById('customerRatingsChart').getContext('2d');
        if (this.customerRatingsChart) this.customerRatingsChart.destroy();
  
        this.customerRatingsChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
              data: [
                this.ratingDistribution[1],
                this.ratingDistribution[2],
                this.ratingDistribution[3],
                this.ratingDistribution[4],
                this.ratingDistribution[5]
              ],
              backgroundColor: ['#ff9999', '#ffc966', '#ffff66', '#99ff99', '#66b3ff']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' }
            }
          }
        });
      },
      
      renderServiceRequestsChart() {
        const ctx = document.getElementById('serviceRequestsChart').getContext('2d');
        if (this.serviceRequestsChart) this.serviceRequestsChart.destroy();
  
        this.serviceRequestsChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Requested', 'Accepted', 'Closed', 'Rejected'],
            datasets: [{
              label: 'Service Requests',
              data: [
                this.$store.state.serviceRequests.filter(req => req.service_status === 'requested').length,
                this.$store.state.serviceRequests.filter(req => req.service_status === 'accepted').length,
                this.$store.state.serviceRequests.filter(req => req.service_status === 'closed').length,
                this.$store.state.serviceRequests.filter(req => req.service_status === 'rejected').length
              ],
              backgroundColor: ['#77bff3', '#a2e8a2', '#f2a2a2', '#66b3ff'],
              borderRadius: 5,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    },
    watch: {
      '$store.state.serviceRequests': function() {
        this.calculateRatingDistribution();
        this.renderCustomerRatingsChart();
        this.renderServiceRequestsChart();
      }
    }
  };
  