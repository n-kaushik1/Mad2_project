import { injectStyles } from './injectStyles.js';

export default {
  name: 'adminCustomers',
  props: {
    searchQuery: String // Accepts search query from the parent component
  },
  data() {
    return {
      customers: [], // List of all customers fetched from the API
      selectedCustomer: null // Selected customer details for the modal
    };
  },
  computed: {
    // Computed property to filter customers based on the search query
    filteredCustomers() {
      if (!this.searchQuery) {
        return this.customers; // If no query, return all customers
      }
      const lowerQuery = this.searchQuery.toLowerCase();
      return this.customers.filter(customer =>
        customer.name.toLowerCase().includes(lowerQuery)
      );
    }
  },
  methods: {
    async fetchCustomers() {
      try {
        // Fetch customers data from the API
        const token = this.$store.state.auth_token;
        const response = await fetch('/api/admin/customers', {
          headers: { 'Authentication-Token': token }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        this.customers = await response.json();
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    },
    viewCustomer(customer) {
      // Set the selected customer for viewing in the modal
      this.selectedCustomer = customer;
    },
    async toggleActive(customer) {
      try {
        // Toggle active status of a customer
        const token = this.$store.state.auth_token;
        const response = await fetch(`/api/admin/customers/${customer.id}`, {
          method: 'PATCH',
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json' // Assuming you need this header
          },
          body: JSON.stringify({ active: !customer.active }) // Send the updated status
        });
        const result = await response.json();

        if (response.ok && result.message.includes("successfully")) {
          customer.active = !customer.active; // Update active status locally
        } else {
          console.error('Error toggling customer status:', result.message);
        }
      } catch (error) {
        console.error('Error updating customer status:', error);
      }
    },
    closeModal() {
      this.selectedCustomer = null; // Reset selected customer when modal is closed
    }
  },
  mounted() {
    this.fetchCustomers();
    injectStyles();
  },
  template: `
  <div> 
    <div class="container my-5">
      <h2 class="mb-4">Customers</h2>
      <div class="table-wrapper">
        <table v-if="filteredCustomers.length > 0" class="table table-hover table-bordered">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id">
              <td>{{ customer.id }}</td>
              <td>{{ customer.name }}</td>
              <td class="text-center">
                <button 
                  class="btn btn-info btn-sm me-1" 
                  @click="viewCustomer(customer)"
                  data-bs-toggle="modal" 
                  data-bs-target="#customerDetailsModal"
                >
                  View
                </button>
                <button 
                  :class="customer.active ? 'btn btn-danger btn-sm' : 'btn btn-success btn-sm'" 
                  @click="toggleActive(customer)"
                >
                  {{ customer.active ? 'Block' : 'Unblock' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted text-center">No Customers available.</p>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div class="modal fade" id="customerDetailsModal" tabindex="-1" aria-labelledby="customerDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="customerDetailsModalLabel">Customer Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedCustomer">
              <table class="table table-bordered">
                <tbody>
                  <tr><th>ID</th><td>{{ selectedCustomer.id }}</td></tr>
                  <tr><th>Name</th><td>{{ selectedCustomer.name }}</td></tr>
                  <tr><th>Email</th><td>{{ selectedCustomer.email }}</td></tr>
                  <tr><th>Address</th><td>{{ selectedCustomer.address || 'N/A' }}</td></tr>
                  <tr><th>Pin Code</th><td>{{ selectedCustomer.pin_code || 'N/A' }}</td></tr>
                  <tr><th>Status</th><td>{{ selectedCustomer.active ? 'Active' : 'Blocked' }}</td></tr>
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
