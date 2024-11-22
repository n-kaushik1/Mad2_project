export default {
    name: 'adminProfessionalsReq',
    template: `
      <div class="table-wrapper">
      <div class="container my-5">
          <table class="table table-striped table-hover">
              <thead class="thead-light">
                  <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Experience (Yrs)</th>
                      <th scope="col">Service Name</th>
                      <th scope="col" class="text-center">Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="professional in professionals" :key="professional.id">
                      <td>{{ professional.id }}</td>
                      <td>{{ professional.name }}</td>
                      <td>{{ professional.experience }} years</td>
                      <td>{{ professional.service_type || 'N/A' }}</td>
                      <td class="text-center">
                          <button 
                              class="btn btn-info btn-sm me-1" 
                              @click="viewProfessional(professional)"
                              data-bs-toggle="modal" 
                              data-bs-target="#professionalDetailsModal"
                          >View</button>
                          <button 
                              class="btn btn-success btn-sm me-1" 
                              @click="changeProfessionalPermission(professional.id, 'approve')"
                          >Approve</button>
                          <button 
                              class="btn btn-danger btn-sm" 
                              @click="changeProfessionalPermission(professional.id, 'reject')"
                          >Reject</button>
                      </td>
                  </tr>
              </tbody>
          </table>
          
          </div>
  
          <!-- Professional Details Modal -->
          <div class="modal fade" id="professionalDetailsModal" tabindex="-1" aria-labelledby="professionalDetailsModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-lg modal-dialog-centered">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="professionalDetailsModalLabel">Professional Details</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                          <div v-if="selectedProfessional">
                              <table class="details-table">
                                  <tr>
                                      <th>ID</th>
                                      <td>{{ selectedProfessional.id }}</td>
                                  </tr>
                                  <tr>
                                      <th>Name</th>
                                      <td>{{ selectedProfessional.name }}</td>
                                  </tr>
                                  <tr>
                                      <th>Email</th>
                                      <td>{{ selectedProfessional.email }}</td>
                                  </tr>
                                  <tr>
                                      <th>Experience</th>
                                      <td>{{ selectedProfessional.experience }} years</td>
                                  </tr>
                                  <tr>
                                      <th>Service</th>
                                      <td>{{ selectedProfessional.service_type || 'N/A' }}</td>
                                  </tr>
                                  <tr>
                                      <th>Description</th>
                                      <td>{{ selectedProfessional.description || 'N/A' }}</td>
                                  </tr>
                                  <tr>
                                      <th>Address</th>
                                      <td>{{ selectedProfessional.address || 'N/A' }}</td>
                                  </tr>
                                  <tr>
                                      <th>Pin Code</th>
                                      <td>{{ selectedProfessional.pin_code || 'N/A' }}</td>
                                  </tr>
                                  <tr>
                                      <th>Date Created</th>
                                      <td>{{ selectedProfessional.date_created || 'N/A' }}</td>
                                  </tr>
                                  <tr v-if="selectedProfessional.document_url">
                                      <th>Document</th>
                                      <td>
                                          <a 
                                              :href="selectedProfessional.document_url" 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              class="btn btn-link text-primary"
                                          >
                                              View Document
                                          </a>
                                      </td>
                                  </tr>
                              </table>
                          </div>
                          <div v-else>
                              <p>Loading...</p>
                          </div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      </div>
                  </div>
              </div>
          </div>
  
      </div>
    `,
  
    data() {
      return {
        professionals: [],
        selectedProfessional: null,
      };
    },
    computed: {
      pendingProfessionals() {
        return this.professionals.filter(prof => prof.status === 'pending');
      },
    },
    methods: {
      formatDate(dateString) {
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleString();
      },
      
      async fetchProfessionals() {
        try {
          const token = this.$store.state.auth_token;
          if (!token) return;
  
          const res = await fetch(`${location.origin}/api/admin/professionals`, {
            headers: { 'Authentication-Token': token },
          });
          if (res.ok) {
            const data = await res.json();
            this.professionals = data.map(prof => ({
              ...prof,
              date_created: this.formatDate(prof.date_created),
              document_url: prof.document_url || null, // Include document URL if it exists
            }));
          } else {
            console.error('Failed to fetch professionals:', await res.text());
          }
        } catch (error) {
          console.error('Error fetching professionals:', error);
        }
      },
  
      viewProfessional(professional) {
        this.selectedProfessional = professional;
      },
  
      async changeProfessionalPermission(professionalId, action) {
        try {
          const token = this.$store.state.auth_token;
          if (!token) return;
  
          const res = await fetch(`${location.origin}/api/admin/professionals/${professionalId}`, {
            method: 'POST',
            headers: { 
              'Authentication-Token': token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          });
  
          if (res.ok) {
            this.fetchProfessionals();
          } else {
            console.error(`Failed to ${action} professional:`, await res.text());
          }
        } catch (error) {
          console.error(`Error ${action}ing professional:`, error);
        }
      },
    },
  
    mounted() {
      this.fetchProfessionals();
    },
  };
  