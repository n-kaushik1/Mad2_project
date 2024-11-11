import { injectStyles } from './injectStyles.js';

export default {
    name: 'ProfessionalServiceRequests',
    props: {
        searchQuery: String
    },
    template: `
    <div class="container my-5">
        <!-- New Service Requests Table -->
        <h2>New Service Requests</h2>
        <div class="table-wrapper section">
            <table v-if="newServiceRequests.length" class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer Name</th>
                        <th scope="col">Address</th>
                        <th class="text-end pe-4" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in newServiceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer_name || 'Unavailable' }}</td>
                        <td>{{ request.address || 'Unavailable' }}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-primary" @click="openRequestDetails(request)">View</button>
                            <button class="btn btn-success ms-2" @click="acceptRequest(request.id)">Accept</button>
                            <button class="btn btn-danger ms-2" @click="rejectRequest(request.id)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted">No new service requests available.</p>
        </div>
         <br>
        <!-- Assigned Service Requests Table -->
        <h2>Assigned Service Requests</h2>
        <div class="table-wrapper section">
            <table v-if="assignedServiceRequests.length"  class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer Name</th>
                        <th scope="col">Address</th>
                        <th class="text-end pe-4" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in assignedServiceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer_name || 'Unavailable' }}</td>
                        <td>{{ request.address || 'Unavailable' }}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-primary" @click="openRequestDetails(request)">View</button>
                            <button class="btn btn-warning ms-2" @click="confirmCloseRequest(request.id)">Close Request</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted">No assigned service requests available.</p>
        </div>

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
                            <tr><th>Customer Message</th><td>{{ selectedRequest.customer_msg || 'None' }}</td></tr>
                            <tr><th>Customer Phone</th><td>{{ selectedRequest.customer_phone || 'N/A' }}</td></tr>
                            <tr><th>Address</th><td>{{ selectedRequest.address || 'Unavailable' }}</td></tr>
                            <tr><th>Pin Code</th><td>{{ selectedRequest.pin_code || 'N/A' }}</td></tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Close Confirmation Modal -->
        <div v-if="showCloseConfirmation" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Close Request</h5>
                        <button type="button" class="btn-close" @click="cancelCloseRequest" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to close this request?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="cancelCloseRequest">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="confirmCloseRequestAction">Confirm</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedRequest || showCloseConfirmation" class="modal-backdrop fade show"></div>
    </div>
    `,
    data() {
        return {
            selectedRequest: null,         // Selected request details for the modal
            errorMessage: null,            // Error message in case of any failure
            showCloseConfirmation: false,  // Flag for showing close confirmation modal
            requestToClose: null           // Holds the ID of the request to close
        };
    },
    computed: {
        serviceRequests() {
            return this.$store.state.serviceRequests;
        },
        newServiceRequests() {
            return this.serviceRequests.filter(request => request.service_status === 'requested');
        },
        assignedServiceRequests() {
            return this.serviceRequests.filter(request => request.service_status === 'accepted');
        }
    },
    created() {
        injectStyles();
        this.$store.dispatch('fetchServiceRequests');
    },
    methods: {
        filterRequests(requests) {
            if (!this.searchQuery) return requests;
            const query = this.searchQuery.toLowerCase();
            return requests.filter(request =>
                (request.customer_name && request.customer_name.toLowerCase().includes(query)) ||
                (request.address && request.address.toLowerCase().includes(query)) ||
                (request.pin_code && request.pin_code.toString().includes(query))
            );
        },
        formatDate(date) {
            return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
        openRequestDetails(request) {
            this.selectedRequest = request;
        },
        closeModal() {
            this.selectedRequest = null;
        },
        confirmCloseRequest(requestId) {
            this.requestToClose = requestId;
            this.showCloseConfirmation = true;
        },
        cancelCloseRequest() {
            this.showCloseConfirmation = false;
            this.requestToClose = null;
        },
        async confirmCloseRequestAction() {
            if (this.requestToClose) {
                await this.$store.dispatch('closeRequest', this.requestToClose);
                this.showCloseConfirmation = false;
                this.requestToClose = null;
            }
        },
        async acceptRequest(requestId) {
            await this.$store.dispatch('acceptRequest', requestId);
        },
        async rejectRequest(requestId) {
            await this.$store.dispatch('rejectRequest', requestId);
        }
    }
};
