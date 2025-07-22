document.addEventListener("DOMContentLoaded", function () {
  const users = JSON.parse(localStorage.getItem("Users")) || [];

  function showAlert(message, type) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} bg-dark text-light alert-dismissible fade show`;
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close btn-light" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const container = document.getElementById("alert-container");
    if (container) {
      container.appendChild(alertDiv);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        alertDiv.classList.remove("show");
        alertDiv.classList.add("hide");
        setTimeout(() => alertDiv.remove(), 500); // remove after fade
      }, 2000);
    }
  }

  // SIGN UP
  const signUpForm = document.getElementById("signupForm");
  if (signUpForm) {
    signUpForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const usersData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
      };

      if (
        !usersData.firstName ||
        !usersData.lastName ||
        !usersData.email ||
        !usersData.password
      ) {
        showAlert("Please fill all fields correctly!", "secondary");
        return;
      }

      users.push(usersData);
      localStorage.setItem("Users", JSON.stringify(users));
      window.location.href = "login.html";
      showAlert("Account created successfully!", "success");
    });
  }

  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        showAlert("Please fill all fields correctly!", "secondary");
        return;
      }

      const getUsers = JSON.parse(localStorage.getItem("Users")) || [];
      const matchedUser = getUsers.find(
        (user) => user.email === email && user.password === password
      );

      if (matchedUser) {
        localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
        window.location.href = "games.html";
      } else {
        alert("Record not found!");
        loginForm.reset();
      }
    });
  }

  // GAMES PAGE + ADD TO CART
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const addToCartButtons = document.querySelectorAll(".addtocart");

  const navbar = document.getElementById("navbar-nav");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcome = document.querySelector(".welcome");

  // Show Logout Button if user is logged in
  if (user && navbar) {
    const logoutBtn = document.createElement("li");
    logoutBtn.className = "nav-item";
    logoutBtn.innerHTML = `
    <a id="logoutBtn" class="btn btn-dark ms-2 animate__animated animate__fadeInDown" href="#">
    Logout
    </a>
    `;
    navbar.appendChild(logoutBtn);

    const currUser = document.createElement("div");
    currUser.className = "d-flex justify-content-center";
    currUser.innerHTML = `
    <p class="fs-1 animate__animated animate__fadeInDown">Welcome, ${user.firstName} <i class="bi bi-person-fill-check"></i></p>
    `;
    welcome.appendChild(currUser);

    // Logout Function
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("cart")
      showAlert("You have been logged out.", "success");
      window.location.href = "login.html";
    });
  }

  // Add to Cart Functionality
  addToCartButtons.forEach((button) => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    button.addEventListener("click", function () {
      if (!user) {
        showAlert("Please login first to add items to your cart.", "success");
        return;
      }

      const gameID = this.dataset.id;
      const gameName = this.dataset.name;
      const gamePrice = parseFloat(this.dataset.price);

      const existingGame = cart.find((item) => item.id === gameID);

      if (existingGame) {
        existingGame.quantity += 1;
      } else {
        cart.push({
          id: gameID,
          name: gameName,
          price: gamePrice,
          quantity: 1,
        });
      }

      const cartIcon = document.getElementById("cart")
      localStorage.setItem("cart", JSON.stringify(cart));
      showAlert(`${gameName} added to cart!`);
      cartIcon.className = "fw-bold"
    });
  });
});

// cart
document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.querySelector(".cartItems");
  const user = JSON.parse(localStorage.getItem("loggedInUser"))
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!cartItemsContainer) return;

  function renderCart() {
    if (cart.length === 0 && !user) {
      cartItemsContainer.innerHTML = `<h4 class="m-4 d-flex justify-content-center">Your cart is empty.</h4>`;
      return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = ""; // clear existing content

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      cartItemsContainer.innerHTML += `
        <div class="card m-3 p-4 ms-4 bg-transparent cart-item" data-index="${index}">
          <h5>${item.name}</h5>
          <p>Price: $${item.price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="btn btn-sm btn-outline-dark decrease-btn">−</button>
            <span class="quantity mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-dark increase-btn">+</button>
          </div>
          <p class="item-total">Total: $${itemTotal.toFixed(2)}</p>
          <button class="btn btn-dark btn-sm w-25 remove-item" data-index="${index}">Remove</button>
        </div>
      `;
    });

    cartItemsContainer.innerHTML += `
      <div class="m-5" id="grandTotalContainer">
        <h4 class="fw-bold display-5"> Grand Total: $${total.toFixed(2)}</h4>
        <button class="btn btn-outline-dark mt-3" onclick="checkout()">Proceed to checkout</button>
      </div>
    `;

    setupListeners(); // add events
  }

  function setupListeners() {
    document.querySelectorAll(".cart-item").forEach((itemElement, i) => {
      const decreaseBtn = itemElement.querySelector(".decrease-btn");
      const increaseBtn = itemElement.querySelector(".increase-btn");
      const quantitySpan = itemElement.querySelector(".quantity");
      const itemTotalEl = itemElement.querySelector(".item-total");

      increaseBtn.addEventListener("click", () => {
        cart[i].quantity++;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });

      decreaseBtn.addEventListener("click", () => {
        if (cart[i].quantity > 1) {
          cart[i].quantity--;
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart();
        }
      });

      const removeBtn = itemElement.querySelector(".remove-item");
      removeBtn.addEventListener("click", () => {
        cart.splice(i, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
  }

  renderCart();
});

function checkout() {
  localStorage.removeItem("cart");
  location.reload();
}
