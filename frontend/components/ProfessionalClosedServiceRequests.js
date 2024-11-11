import { injectStyles } from './injectStyles.js';

export default {
    name: 'ProfessionalClosedServiceRequests',
    props: {
        searchQuery: String,
        searchField: String
    },
    computed: {
        closedServiceRequests() {
            // Get closed service requests from Vuex state
            return this.$store.state.serviceRequests.filter(request => request.service_status === 'closed');
        },
         filteredRequests() {
        if (!this.searchQuery) return this.closedServiceRequests;

        const query = this.searchQuery.toLowerCase().trim();

        return this.closedServiceRequests.filter(request => {
            const fieldValue = request[this.searchField];

            if (this.searchField === "date_of_request" && fieldValue) {
                const requestDate = new Date(fieldValue);
                const formattedRequestDate = `${(requestDate.getMonth() + 1).toString().padStart(2, '0')}-${requestDate.getDate().toString().padStart(2, '0')}-${requestDate.getFullYear()}`;
                return formattedRequestDate === query;
            }

            // Address and pin code comparison
            if (this.searchField === "address" && fieldValue) {
                // Trim and convert both values to lowercase for more robust matching
                return fieldValue.toLowerCase().includes(query);
            }
            
            if (this.searchField === "pin_code" && fieldValue) {
                return fieldValue.toString().includes(query);
            }

            // Default comparison for other fields (if needed)
            return fieldValue && fieldValue.toString().toLowerCase().includes(query);
        });
    }
},
    created() {
        injectStyles();
        this.$store.dispatch('fetchServiceRequests');
    },
    watch: {
        closedServiceRequests(newRequests) {
            if (this.selectedRequest) {
                const updatedRequest = newRequests.find(request => request.id === this.selectedRequest.id);
                if (updatedRequest) {
                    this.selectedRequest = updatedRequest;
                }
            }
        }
    },
    methods: {
        formatDate(date) {
            return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
        openRequestDetails(request) {
            this.selectedRequest = request;
        },
        closeModal() {
            this.selectedRequest = null;
        },
        async downloadProfessionalClosedRequests() {
            try {
                // Replace `professionalId` with the actual ID of the logged-in professional
                const response = await fetch(`/create-professional-csv/${this.$store.state.user_id}`,{
                    headers: {
                        "Content-Type": "application/json",
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                const data = await response.json();
    
                if (response.ok) {
                    // Polling to check when the file is ready to download
                    let downloadResponse;
                    do {
                        downloadResponse = await fetch(`/get-professional-csv/${data.task_id}`,{
                            headers: {
                                "Content-Type": "application/json",
                                'Authentication-Token': this.$store.state.auth_token
                            }
                        });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } while (!downloadResponse.ok);
    
                    const blob = await downloadResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ClosedServiceRequests_${this.$store.state.user_id}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    alert("Failed to initiate CSV download.");
                }
            } catch (error) {
                console.error("Error downloading CSV:", error);
                alert("An error occurred while downloading the report.");
            }
        }
    },
    data() {
        return {
            selectedRequest: null,     // Selected request details for the modal
        };
    },
    template: `
    <div class="container my-5">
        <!-- Closed Service Requests Table -->
        <div class="table-wrapper">
            <table v-if="closedServiceRequests.length > 0" class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer Name</th>
                        <th scope="col">Address</th>
                        <th class="text-end pe-4" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in filteredRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer_name || 'Unavailable' }}</td>
                        <td>{{ request.address || 'Unavailable' }}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-primary" @click="openRequestDetails(request)">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted">No new service requests available.</p>
        </div>
        <br>
        <button v-if="closedServiceRequests.length > 0"  class="btn btn-success my-3" @click="downloadProfessionalClosedRequests">Download Closed Requests Report</button>

        <!-- Modal for displaying request details -->
        <div v-if="selectedRequest" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Request Details</h5>
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="details-table">
                            <tr><th>ID</th><td>{{ selectedRequest.id }}</td></tr>
                            <tr><th>Service ID</th><td>{{ selectedRequest.service_id }}</td></tr>
                            <tr><th>Service Name</th><td>{{ selectedRequest.service_name || 'Unknown' }}</td></tr>
                            <tr><th>Customer Name</th><td>{{ selectedRequest.customer_name || 'Unknown' }}</td></tr>
                            <tr><th>Date of Request</th><td>{{ formatDate(selectedRequest.date_of_request) }}</td></tr>
                            <tr><th>Remarks</th><td>{{ selectedRequest.remarks || 'None' }}</td></tr>
                            <tr><th>Customer Phone</th><td>{{ selectedRequest.customer_phone || 'N/A' }}</td></tr>
                            <tr><th>Address</th><td>{{ selectedRequest.address || 'Unavailable' }}</td></tr>
                            <tr><th>Pin Code</th><td>{{ selectedRequest.pin_code || 'N/A' }}</td></tr>
                            <tr><th>Ratings</th><td>{{ selectedRequest.rating || 'N/A' }} ★</td></tr>
                            <tr><th>Date of completion</th><td>{{ formatDate(selectedRequest.date_of_completion) || 'N/A' }}</td></tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedRequest" class="modal-backdrop fade show"></div>
    </div>
    `
};
