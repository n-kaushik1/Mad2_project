export default {
  template: `
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-lg">
          <div class="card-header bg-info text-white text-center">
            <h4>Register</h4>
          </div>
          <div class="card-body">
            <!-- Common Fields -->
            <div class="form-group mb-3">
              <label for="name">Name</label>
              <input type="text" class="form-control" id="name" placeholder="Enter your name" v-model="name" />
            </div>

            <div class="form-group mb-3">
              <label for="email">Email</label>
              <input type="email" class="form-control" id="email" placeholder="Enter your email" v-model="email" />
            </div>

            <div class="form-group mb-3">
              <label for="password">Password</label>
              <input type="password" class="form-control" id="password" placeholder="Enter your password" v-model="password" />
            </div>

            <div class="form-group mb-3">
              <label for="role">Select Role:</label>
              <select class="form-control" id="role" v-model="role">
                <option disabled value="">Please select a role</option>
                <option value="Service Professional">Service Professional</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <!-- Address Field -->
            <div class="form-group mb-3">
              <label for="address">Address</label>
              <input type="text" class="form-control" id="address" placeholder="Enter your address" v-model="address" />
            </div>

            <!-- Pin Code Field -->
            <div class="form-group mb-3">
              <label for="pinCode">Pin Code</label>
              <input type="text" class="form-control" id="pinCode" placeholder="Enter your pin code" v-model="pinCode" />
            </div>

            <!-- Fields specific to 'Service Professional' -->
            <div v-if="role === 'Service Professional'">
              <div class="form-group mb-3">
                <label for="serviceType">Service Type</label>
                <select class="form-control" id="serviceType" v-model="serviceType">
                  <option disabled value="">Select a service</option>
                  <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label for="description">Description</label>
                <textarea class="form-control" id="description" placeholder="Enter a description" v-model="description"></textarea>
              </div>

              <div class="form-group mb-3">
                <label for="experience">Experience (in years)</label>
                <input type="number" class="form-control" id="experience" placeholder="Enter your experience" v-model="experience" />
              </div>
              <div class="form-group mb-3">
      <label for="document">Upload Document (e.g., Resume ,Certification (in pdf))</label>
      <input
        type="file"
        class="form-control"
        id="document"
        @change="handleFileUpload"
      />
    </div>
            </div>

            <button class="btn btn-primary" @click="submitRegister" :disabled="!isFormComplete">Register</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      name: '',
      email: '',
      password: '',
      role: '',
      address: '',
      pinCode: '',
      serviceType: '',
      description: '',
      experience: '',
      services: [], // List of available services
      document: null,
    };
  },
  computed: {
    isFormComplete() {
      return (
        this.name &&
        this.email &&
        this.password &&
        this.role &&
        this.address &&
        this.pinCode &&
        (this.role !== 'Service Professional' || (this.serviceType && this.description && this.experience))
      );
    },
  },
  async created() {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        this.services = data; // data is a list of services
      } else {
        console.error('Failed to fetch services:', response.status);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  },
  methods: {
    handleFileUpload(event) {
      this.document = event.target.files[0]; // Store the selected file
    },
    async convertToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file); // Convert file to Base64
      });
    },
    async submitRegister() {
      const registrationData = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        address: this.address,
        pinCode: this.pinCode,
      };

      if (this.role === 'Service Professional') {
        registrationData.serviceType = this.serviceType;
        registrationData.description = this.description;
        registrationData.experience = this.experience;
        if (this.document) {
          try {
            registrationData.document = await this.convertToBase64(this.document);
          } catch (error) {
            alert('Error converting document to Base64.');
            console.error(error);
            return;
          }
        }
      }

      try {
        const res = await fetch(`${location.origin}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const responseData = await res.json();

        if (res.ok) {
          alert(responseData.message);
          this.clearFormFields();
        } else {
          alert(responseData.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Error during registration:', error);
      }
    },
    clearFormFields() {
      // Reset all form fields
      this.name = '';
      this.email = '';
      this.password = '';
      this.role = '';
      this.address = '';
      this.pinCode = '';
      this.serviceType = '';
      this.description = '';
      this.experience = '';
      this.document = null;
    },
  },
};
