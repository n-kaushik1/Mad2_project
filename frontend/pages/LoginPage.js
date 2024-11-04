export default {
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow p-4">
            <h3 class="text-center mb-4">Login</h3>
            
            <!-- Email Input -->
            <div class="form-group mb-3">
              <label for="email">Email</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">
                    <i class="fas fa-envelope"></i>
                  </span>
                </div>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Enter your email"
                  v-model="email"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="form-group mb-3">
              <label for="password">Password</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  placeholder="Enter your password"
                  v-model="password"
                />
              </div>
            </div>

            <!-- Login Button -->
            <button class="btn btn-info btn-block" @click="submitLogin">Login</button>

            <div class="text-center mt-3">
              <router-link to="/register" class="text-info">Don't have an account? Register</router-link>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger mt-3">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: null,
      password: null,
      error: null, // Error message to display if login fails
    };
  },
  methods: {
    async submitLogin() {
      try {
        const res = await fetch(location.origin + '/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        if (res.ok) {
          const data = await res.json();
          const role = Array.isArray(data.role) ? data.role[0] : data.role;
          localStorage.setItem('user', JSON.stringify({ ...data, role }));
          this.$store.commit('setUser');

          // Redirect based on role
          if (role === 'Admin') {
            this.$router.push('/admin');
          } else if (role === 'Customer') {
            this.$router.push('/customer');
          } else if (role === 'Service Professional') {
            this.$router.push('/professional');
          } else {
            console.error('Unknown role:', role);
            this.$router.push('/');
          }
        } else {
          const data = await res.json();
          if (res.status === 403) {
            // Set error message for inactive account
            this.error = data.message;
          } else {
            // Set generic error message
            this.error = data.message || 'Login failed. Please try again.';
          }
        }
      } catch (error) {
        console.error('Error during login:', error);
        this.error = 'An unexpected error occurred. Please try again later.';
      }
    },
  },
};
