import { injectStyles } from './injectStyles.js';

export default {
    template: `
       <div class="container my-5">
          <!-- Service Requests Table -->
          <div class="table-wrapper">
             <table v-if="serviceRequests.length > 0" class="table table-striped table-hover">
                <thead>
                   <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Service Name</th>
                      <th scope="col">Professional Name</th>
                      <th scope="col">Status</th>
                      <th class="text-end pe-4" scope="col">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   <tr v-for="request in serviceRequests" :key="request.id">
                      <td>{{ request.id }}</td>
                      <td>{{ request.service_name }}</td>
                      <td>{{ request.professional_name || 'N/A' }}</td>
                      <td>{{ request.service_status }}</td>
                      <td class="text-end pe-4">
                         <button class="btn btn-primary" @click="viewRequestDetails(request)">
                            View
                         </button>
                         <button v-if="request.service_status == 'accepted'" 
                                 @click="openCloseRequestModal(request)" 
                                 class="btn btn-secondary ms-2">
                            Close Request
                         </button>
      
                         <button v-if="request.service_status === 'closed' && (!request.remarks || !request.rating)"
                                 @click="openRatingModal(request)"
                                 class="btn btn-warning ms-2">
                            Give Rating
                         </button>
                      </td>
                   </tr>
                </tbody>
                <br>
             </table>
             <p v-else class="text-muted">No service requests found.</p>
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
                         <tr><th>Service Name</th><td>{{ selectedRequest.service_name || 'Unknown' }}</td></tr>
                         <tr><th>Customer message</th><td>{{ selectedRequest.customer_msg || 'Unknown' }}</td></tr>
                         <tr><th>Date of Request</th><td>{{ formatDate(selectedRequest.date_of_request) }}</td></tr>
                         <tr><th>Remarks</th><td>{{ selectedRequest.remarks || 'None' }}</td></tr>
                         <tr><th>Address of service</th><td>{{ selectedRequest.address || 'Unavailable' }}</td></tr>
                         <tr><th>Pin Code</th><td>{{ selectedRequest.pin_code || 'N/A' }}</td></tr>
                         <tr><th>Date of Completion</th><td>{{ formatDate(selectedRequest.date_of_completion) || 'N/A' }}</td></tr>
                      </table>
                   </div>
                   <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Modal for closing request with remarks and rating -->
          <div v-if="closeRequestModalVisible" class="modal fade show" tabindex="-1" style="display: block;">
             <div class="modal-dialog modal-lg">
                <div class="modal-content">
                   <div class="modal-header">
                      <h5 class="modal-title">Provide Rating and Remarks</h5>
                      <button type="button" class="btn-close" @click="closeCloseRequestModal" aria-label="Close"></button>
                   </div>
                   <div class="modal-body">
                      <div class="mb-3">
                         <label for="closeRequestRemarks" class="form-label">Remarks</label>
                         <textarea v-model="closeRequestRemarks" id="closeRequestRemarks" class="form-control" rows="3"></textarea>
                      </div>
                      <div class="mb-3">
                         <label for="closeRequestRating" class="form-label">Rating</label>
                         <select v-model="closeRequestRating" id="closeRequestRating" class="form-select">
                            <option value="">Select a rating</option>
                            <option v-for="n in 5" :key="n" :value="n">{{ n }} Star(s)</option>
                         </select>
                      </div>
                   </div>
                   <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" @click="closeCloseRequestModal">Cancel</button>
                      <button type="button" class="btn btn-primary" @click="submitCloseRequest">Submit</button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    `,
    data() {
       return {
          serviceRequests: [],
          selectedRequest: null,
          closeRequestModalVisible: false,
          closeRequestRemarks: '',
          closeRequestRating: null,
          requestToClose: null,
       };
    },
    created() {
       injectStyles();
       this.fetchServiceRequests();
    },
    methods: {
       fetchServiceRequests() {
          fetch('/api/customers/servicerequest', {
             headers: {
                'Authentication-Token': this.$store.state.auth_token
             }
          })
          .then(response => response.json())
          .then(data => {
             this.serviceRequests = data || [];
          })
          .catch(error => {
             console.error('Error fetching service requests:', error);
          });
       },
       openCloseRequestModal(request) {
          this.requestToClose = request;
          this.closeRequestModalVisible = true;
          this.closeRequestRemarks = '';
          this.closeRequestRating = null;
       },
       openRatingModal(request) {
          this.requestToClose = request;
          this.closeRequestRemarks = request.remarks || '';
          this.closeRequestRating = request.rating || null;
          this.closeRequestModalVisible = true;
       },
       closeModal() {
          this.selectedRequest = null;
       },
       closeCloseRequestModal() {
          this.closeRequestModalVisible = false;
          this.requestToClose = null;
       },
       submitCloseRequest() {
          if (!this.closeRequestRating) {
             alert("Please select a rating.");
             return;
          }

          fetch(`/api/customers/requests/${this.requestToClose.id}`, {
             method: 'PUT',
             headers: {
                'Authentication-Token': this.$store.state.auth_token,
                'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                action: 'close',
                remarks: this.closeRequestRemarks,
                rating: this.closeRequestRating
             })
          })
          .then(response => response.json())
          .then(data => {
             if (data.message === 'Service request closed') {
                this.fetchServiceRequests();
                this.closeCloseRequestModal();
             }
          })
          .catch(error => {
             console.error('Error closing request:', error);
          });
       },
       formatDate(date) {
          return date ? new Date(date).toLocaleString() : 'N/A';
       },
       viewRequestDetails(request) {
          this.selectedRequest = request;
       }
    }
};
