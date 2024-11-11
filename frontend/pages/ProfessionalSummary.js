export default {
    template: `
    <div class="professional">
    <div class="dashboard">
        <!-- Reviews/Ratings Chart -->
        <div class="section">
            <h3 class="text-center">Reviews/Ratings</h3>
            <canvas id="reviewsRatingsChart"></canvas>
        </div>
        
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
            serviceRequestsChart: null,
            reviewsRatingsChart: null,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // Initialize distribution for ratings 1 to 5
        };
    },
    mounted() {
        this.$store.dispatch('fetchServiceRequests').then(() => {
            this.calculateRatingDistribution(); // Calculate ratings after fetching requests
            this.renderServiceRequestsChart();   // Render service requests chart
            this.renderReviewsRatingsChart();     // Render reviews/ratings chart
        });
    },
    methods: {
        calculateRatingDistribution() {
            // Reset rating distribution counts
            this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

            // Calculate the distribution of ratings from serviceRequests
            this.$store.state.serviceRequests.forEach(request => {
                const rating = request.rating;
                if (rating >= 1 && rating <= 5) {
                    this.ratingDistribution[rating] += 1;
                }
            });
        },
        
        renderServiceRequestsChart() {
            const ctx = document.getElementById('serviceRequestsChart').getContext('2d');

            // Destroy the previous instance of the chart, if it exists
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
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        
        renderReviewsRatingsChart() {
            const ctx = document.getElementById('reviewsRatingsChart').getContext('2d');
            
            // Destroy the previous instance of the chart, if it exists
            if (this.reviewsRatingsChart) this.reviewsRatingsChart.destroy();

            this.reviewsRatingsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                    datasets: [{
                        label: 'Reviews',
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
        }
    },
    watch: {
        // Watch for changes in the Vuex store's serviceRequests state and recalculate rating distribution
        '$store.state.serviceRequests': function() {
            this.calculateRatingDistribution();
            this.renderServiceRequestsChart();
            this.renderReviewsRatingsChart();
        }
    }
};
