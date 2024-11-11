import { injectStyles } from './injectStyles.js';

export default {
  props: {
    searchQuery: String // Prop to receive the search query from the parent
  },
  data() {
    return {
      professionals: [],       // List of all professionals
      filteredProfessionals: [], // Filtered list based on search query
      selectedProfessional: null // Stores the professional for modal view
    };
  },
  watch: {
    // Watch for changes to the searchQuery prop and filter professionals
    searchQuery(newQuery) {
      this.filterProfessionals(newQuery);
    }
  },
  methods: {
    async fetchProfessionals() {
      try {
        const token = this.$store.state.auth_token;
        const response = await fetch('/api/admin/all_professionals', {
          headers: {
            'Authentication-Token': token
          }
        });
        const data = await response.json();
        this.professionals = data;
        this.filterProfessionals(this.searchQuery); // Initial filter on fetch
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    },
    filterProfessionals(query) {
      // Filter professionals based on the search query
      if (!query) {
        this.filteredProfessionals = this.professionals;
      } else {
        const lowerQuery = query.toLowerCase();
        this.filteredProfessionals = this.professionals.filter(professional =>
          professional.name.toLowerCase().includes(lowerQuery) ||
          professional.description.toLowerCase().includes(lowerQuery)
        );
      }
    },
    viewProfessional(professional) {
      this.selectedProfessional = professional;
    },
    closeModal() {
      this.selectedProfessional = null;
    },
    async toggleActive(professional) {
      try {
        const token = this.$store.state.auth_token;
        const response = await fetch(`/api/admin/professionals/${professional.id}`, {
          method: 'PATCH',
          headers: {
            'Authentication-Token': token
          }
        });
        if (response.ok) {
          this.professionals = this.professionals.map(p =>
            p.id === professional.id ? { ...p, active: !p.active } : p
          );
          this.filterProfessionals(this.searchQuery); // Re-filter list after toggling
        } else {
          console.error('Failed to toggle active status');
        }
      } catch (error) {
        console.error('Error toggling active status:', error);
      }
    }
  },
  async mounted() {
    await this.fetchProfessionals();
    injectStyles(); // Apply custom styles for scrollable table
  },
  template: `
    <div class="container my-5">
      <h2 class="mb-4"> Service Professionals</h2>
      <div class="table-wrapper">
        <table v-if="filteredProfessionals.length > 0" class="table table-hover table-bordered">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professional in filteredProfessionals" :key="professional.id">
              <td>{{ professional.id }}</td>
              <td>{{ professional.name }}</td>
              <td>{{ professional.description }}</td>
              <td class="text-center">
                <button 
                  class="btn btn-info btn-sm me-1" 
                  @click="viewProfessional(professional)"
                  data-bs-toggle="modal" 
                  data-bs-target="#professionalDetailsModal"
                >
                  View
                </button>
                <button 
                  :class="professional.active ? 'btn btn-danger btn-sm' : 'btn btn-success btn-sm'" 
                  @click="toggleActive(professional)"
                >
                  {{ professional.active ? 'Block' : 'Unblock' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted text-center">No professionals available.</p>
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
                <table class="table table-bordered">
                  <tbody>
                    <tr><th>ID</th><td>{{ selectedProfessional.id }}</td></tr>
                    <tr><th>Name</th><td>{{ selectedProfessional.name }}</td></tr>
                    <tr><th>Email</th><td>{{ selectedProfessional.email }}</td></tr>
                    <tr><th>Experience</th><td>{{ selectedProfessional.experience }} years</td></tr>
                    <tr><th>Service</th><td>{{ selectedProfessional.service_type || 'N/A' }}</td></tr>
                    <tr><th>Description</th><td>{{ selectedProfessional.description || 'N/A' }}</td></tr>
                    <tr><th>Address</th><td>{{ selectedProfessional.address || 'N/A' }}</td></tr>
                    <tr><th>Pin Code</th><td>{{ selectedProfessional.pin_code || 'N/A' }}</td></tr>
                    <tr><th>Date Created</th><td>{{ selectedProfessional.date_created || 'N/A' }}</td></tr>
                  </tbody>
                </table>
              </div>
              <div v-else>
                <p>Loading...</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
