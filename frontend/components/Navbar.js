export default {
  name: 'Navbar',
  computed: {
    isLoggedIn() {
      return this.$store.state.loggedIn;
    },
    dashboardhomeRoute() {
      // Determine the dashboard route based on the user's role
      const role = this.$store.state.role;
      if (role === 'Admin') return '/admin';
      if (role === 'Customer') return '/customer';
      if (role === 'Service Professional') return '/professional';
      return '/'; // Default route
    },
    searchhomeRoute() {
      // Determine the search route based on the user's role
      const role = this.$store.state.role;
      if (role === 'Admin') return '/adminsearch';
      if (role === 'Customer') return '/customersearch';
      if (role === 'Service Professional') return '/professionalsearch';
      return '/'; // Default route
    },
    summaryRoute() {
      // Determine the search route based on the user's role
      const role = this.$store.state.role;
      if (role === 'Admin') return '/adminsummary';
      if (role === 'Customer') return '/customersummary';
      if (role === 'Service Professional') return '/professionalsummary';
      return '/'; // Default route
    },
    userRole() {
      return this.$store.state.role;
    },
  },
  methods: {
    handleLogout() {
      this.$store.commit('logout');
      this.$router.push('/login');
    },
  },
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-info">
      <div class="container-fluid">
        <!-- Navbar brand or logo -->
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="/static/logo.jpg" alt="Logo" style="height: 40px; margin-right: 10px;">
          Homely Services
        </router-link>

        <!-- Toggler for mobile view -->
            <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

        <!-- Navbar items -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
          <li v-if="!isLoggedIn" class="nav-item">
          <router-link exact class="nav-link" to="/"><span class="hover-effect">Home</span></router-link>
           </li>
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link class="nav-link" to="/login"><span class="hover-effect">Login</span></router-link>
            </li>
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link class="nav-link" to="/register"><span class="hover-effect">Register</span></router-link>
            </li>
            <!-- After login, Home button redirects to user-specific dashboard -->
            <li v-if="isLoggedIn" class="nav-item">
           <router-link exact class="nav-link" :to="dashboardhomeRoute"><span class="hover-effect">Home</span></router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
            <router-link exact class="nav-link" :to="searchhomeRoute"><span class="hover-effect">Search</span></router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
            <router-link exact class="nav-link" :to="summaryRoute"><span class="hover-effect">Summary</span></router-link>
            </li>
          </ul>
          
          <!-- Display Welcome and Role -->
          <ul class="navbar-nav ms-auto d-flex align-items-center" v-if="isLoggedIn">
            <li class="nav-item">
              <span class="navbar-text welcome-message">
                Welcome, {{ userRole }}
              </span>
            </li>
            <li class="nav-item">
              <button @click="handleLogout" class="btn btn-danger nav-link">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  mounted() {
    const style = document.createElement('style');
    style.innerHTML = `
      .hover-effect {
        transition: color 0.3s, transform 0.3s;
        display: inline-block; 
      }
      .hover-effect:hover {
        color: #008000;
        font-weight: bold; 
        transform: scale(1.1);
      }
      .welcome-message {
        font-weight: bold;
        color: #008000; 
        font-size: 1.1rem;
        margin-right: 20px; 
      }
        /* Active link styles */
    .router-link-active .hover-effect,
    .router-link-exact-active .hover-effect {
      color: #0056b3 !important; /* Add !important to override other styles */
      font-weight: bold;
      text-decoration: underline;
    }
    `;
    document.head.appendChild(style);
  },
};
