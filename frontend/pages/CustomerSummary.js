export default {
    template: `
    <div class="customer">
       <div class="dashboard">
          <!-- Service Requests Chart -->
          <div class="section">
             <h3 class="text-center">Service Requests</h3>
             <canvas id="serviceRequestsChart"></canvas>
          </div>
       </div>
    </div>   
    `,
    data() {
       return {
          serviceRequests: [],
          chart: null // Add a reference for the chart instance
       };
    },
    created() {
       this.fetchServiceRequests();
    },
    methods: {
       fetchServiceRequests() {
          // Fetch service requests data (replace with your actual API call)
          fetch('/api/customers/servicerequest', {
             headers: {
                'Authentication-Token': this.$store.state.auth_token
             }
          })
          .then(response => response.json())
          .then(data => {
             this.serviceRequests = data || [];
             this.renderChart(); // Render chart after data is fetched
          })
          .catch(error => {
             console.error('Error fetching service requests:', error);
          });
       },
       renderChart() {
          const ctx = document.getElementById('serviceRequestsChart').getContext('2d');
          
          // Destroy the existing chart instance if it exists
          if (this.chart) {
             this.chart.destroy();
          }
 
          // Create a new chart instance
          this.chart = new Chart(ctx, {
             type: 'bar',
             data: {
                labels: ['Requested', 'Closed', 'Assigned'],
                datasets: [
                   {
                      label: 'Service Requests',
                      data: [
                         this.serviceRequests.filter(req => req.service_status === 'requested').length,
                         this.serviceRequests.filter(req => req.service_status === 'closed').length,
                         this.serviceRequests.filter(req => req.service_status === 'accepted').length
                      ],
                      backgroundColor: ['#77bff3', '#a2e8a2', '#f2a2a2'],
                      borderRadius: 5,
                      borderWidth: 1
                   }
                ]
             },
             options: {
                responsive: true,
                plugins: {
                   legend: { display: false }
                },
                scales: {
                   y: {
                      beginAtZero: true
                   }
                }
             }
          });
       }
    }
 };
 