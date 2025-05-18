document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize the database and sync system
    window.dbStores = await window.initWebAppMarketDBSync();
    
    console.log('WebAppMarketDB initialized and synchronized');
    
    // Check if auth forms exist and attach event listeners
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', window.registerUser);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', window.loginUser);
    }
    
  } catch (error) {
    console.error('Error initializing WebAppMarketDB:', error);
  }
});