export default {
  name: 'Navbar',
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
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar items -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
};
