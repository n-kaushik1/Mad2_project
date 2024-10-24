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

          <!-- Additional Links (Optional) -->
          <div class="text-center mt-3">
            <router-link to="/register" class="text-info">Don't have an account? Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
`
,
    data() {
        return {
            email: null,
            password: null,
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
                    body: JSON.stringify({ email: this.email, password: this.password }), // Convert body to JSON string
                });

                if (res.ok) {
                    console.log('Login successful');
                    const data = await res.json();
                    console.log(data);
                } else {
                    console.error('Login failed:', res.status);
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        },
    },
};
