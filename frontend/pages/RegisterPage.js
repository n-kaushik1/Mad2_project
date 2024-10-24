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

            <!-- Fields specific to 'Service Professional' -->
            <div v-if="role === 'Service Professional'">
              <div class="form-group mb-3">
                <label for="serviceType">Service Type</label>
                <input type="text" class="form-control" id="serviceType" placeholder="Enter the type of service" v-model="serviceType" />
              </div>

              <div class="form-group mb-3">
                <label for="description">Description</label>
                <textarea class="form-control" id="description" placeholder="Provide a brief description" v-model="description"></textarea>
              </div>

              <div class="form-group mb-3">
                <label for="experience">Experience (in years)</label>
                <input type="number" class="form-control" id="experience" placeholder="Enter your experience in years" v-model="experience" />
              </div>
            </div>

            <button class="btn btn-info btn-block" @click="submitRegister">Register</button>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
    data() {
        return {
            name: '',          // Name field for all users
            email: '',         // Email field for all users
            password: '',      // Password field for all users
            role: '',          // Role selection
            serviceType: '',   // For service professional
            description: '',   // For service professional
            experience: '',    // For service professional
        };
    },
    methods: {
        async submitRegister() {
            if (!this.role) {
                alert("Please select a role");
                return;
            }

            // Data to send in the request
            let registrationData = {
                name: this.name,
                email: this.email,
                password: this.password,
                role: this.role,
            };

            // Add service professional-specific data if the role is 'Service Professional'
            if (this.role === 'Service Professional') {
                registrationData.serviceType = this.serviceType;
                registrationData.description = this.description;
                registrationData.experience = this.experience;
            }

            console.log("Data being sent:", registrationData);  // Debug log the data being sent

            try {
                const res = await fetch(location.origin + '/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData),  // Send registration data
                });

                if (res.ok) {
                    console.log('Registration successful');
                    const data = await res.json();
                    console.log(data);
                } else {
                    console.error('Registration failed:', res.status);
                }
            } catch (error) {
                console.error('Error during registration:', error);
            }
        },
    },
};
