const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
let authToken = localStorage.getItem("authToken");
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const searchType = document.getElementById("search-type");
const searchButton = document.getElementById("search-button");
const resultsGrid = document.getElementById("results-grid");
const loader = document.getElementById("loader");
const messageArea = document.getElementById("message-area");
const recipeModal = document.getElementById("recipe-modal");
const modalCloseButton = document.getElementById("modal-close-button");
const recipeDetailsContent = document.getElementById("recipe-details-content");
const favoritesLink = document.getElementById("favorites-link");
const homeLink = document.getElementById("home-link");
let favorites = [];
const suggestionsBox = document.getElementById("suggestions-box");
const categoryButtons = document.querySelectorAll(".category-btn");
const sectionTitle = document.getElementById("section-title");
let timer;
searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        showSuggestions(searchInput.value.trim());
    }, 300);
});
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm === "") {
        messageArea.textContent = "Please enter a search term";
        return;
    }
    if (searchType.value === "name" && searchTerm.includes(",")) {
        messageArea.textContent =
            'Please select "By Ingredients" to search multiple ingredients.';
        return;
    }
    if (searchType.value === "ingredient") {
        searchByIngredient(searchTerm);
    } else {
        searchRecipes(searchTerm);
    }
});
modalCloseButton.addEventListener("click", () => {
    recipeModal.classList.add("hidden");
});
recipeModal.addEventListener("click", (event) => {
    if (event.target === recipeModal) {
        recipeModal.classList.add("hidden");
    }
});
document.addEventListener("click", (event) => {
    if (!suggestionsBox.contains(event.target)
        && event.target !== searchInput) {
        suggestionsBox.style.display = "none";
    }
});
async function searchByIngredient(ingredient) {
    suggestionsBox.style.display = "none";
    sectionTitle.textContent = "🥕 Ingredient Search Results";
    const ingredients = ingredient
        .split(",")
        .map(item => item.trim().toLowerCase())
        .filter(item => item !== "");
    if (ingredients.length === 0) {
        messageArea.textContent = "Please enter at least one ingredient.";
        return;
    }
    try {
        loader.classList.remove("hidden");
        resultsGrid.innerHTML = "";
        messageArea.textContent = "";
        let ingredientResults = [];
        for (const item of ingredients) {
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(item)}`
            );
            const data = await response.json();
            if (data.meals) {
                ingredientResults.push(data.meals);
            }
        }
        if (ingredientResults.length === 0) {
            messageArea.textContent =
                "No recipes found with these ingredients.";
            return;
        }
        let matchingRecipes;
        if (ingredientResults.length === 1) {
            matchingRecipes = ingredientResults[0];

        } else{
            matchingRecipes = ingredientResults[0].filter(recipe =>
                ingredientResults.every(list =>
                    list.some(item => item.idMeal === recipe.idMeal)
                )
            );
        }
        if (matchingRecipes.length > 0) {
            displayRecipes(matchingRecipes.slice(0, 6));
        } else {
            messageArea.textContent =
                "No recipes found containing all these ingredients.";
        }
    } catch (error) {
        console.log(error);

        messageArea.textContent =
            "⚠️ Unable to load recipes. Please check your internet connection.";
    } finally {
        loader.classList.add("hidden");
    }
}
async function searchByCategory(category){
    try{
        loader.classList.remove("hidden");
        resultsGrid.innerHTML="";
        messageArea.textContent="";
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
        );
        const data = await response.json();

        if(data.meals){
            displayRecipes(data.meals.slice(0,6));
        }else{
            messageArea.textContent="No recipes found.";
        }

    }catch(error){
        console.log(error);
        messageArea.textContent="Unable to load recipes.";
    }finally{
        loader.classList.add("hidden");
    }
}
async function showSuggestions(query) {
    if (query === "") {
        suggestionsBox.style.display = "none";
        return;
    }
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        suggestionsBox.innerHTML = "";
        if (data.meals) {
            data.meals.slice(0, 5).forEach(recipe => {
                const item = document.createElement("div");
                item.classList.add("suggestion-item");
                item.textContent = recipe.strMeal;
                item.addEventListener("click", () => {
                    searchInput.value = recipe.strMeal;
                    suggestionsBox.style.display = "none";
                    searchRecipes(recipe.strMeal);
                });
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.style.display = "block";
        } else {
            suggestionsBox.style.display = "none";
        }
    } catch (error) {
        console.log(error);

        suggestionsBox.style.display = "none";

    }
}
function showRecipeModal(recipe) {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
        let ingredient = recipe[`strIngredient${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredients.push(ingredient);
        }
    }
    recipeDetailsContent.innerHTML = `
    <div class="recipe-layout">
        <div class="main-recipe">
            <h2>${recipe.strMeal}</h2>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <div class="recipe-info-badges">
                <span>🍽 Category: ${recipe.strCategory}</span>
                <span>🌍 Area: ${recipe.strArea}</span>
                <span>🛒 Ingredients: ${ingredients.length} items</span>
            </div>
            <h3>🛒 Ingredients</h3>
            <ul class="ingredients-list">
                ${ingredients.map(item =>
        `<li>${item}</li>`
    ).join("")}
            </ul>
            <h3>👨‍🍳 Instructions</h3>
            <p>${recipe.strInstructions}</p>
            ${recipe.strYoutube
            ?
            `<a href="${recipe.strYoutube}" target="_blank" class="youtube-btn">
                    ▶ Watch on YouTube
                </a>`
            :
            ""
        }
            ${recipe.strSource
            ?
            `<a href="${recipe.strSource}" target="_blank" class="source-btn">
                    🌐 Original Recipe
                </a>`
            :
            ""
        }
        </div>
        <div id="similar-container">
            <h3>🍽 Similar Recipes</h3>
            <p class="similar-loading">Loading similar recipes...</p>
        </div>
    </div>
    `;
    recipeModal.classList.remove("hidden");
    loadSimilarRecipes(recipe.strCategory, recipe.idMeal)
    .then(similarHTML => {
    const similarContainer = document.getElementById("similar-container");
          if (similarContainer) {
            similarContainer.innerHTML = similarHTML;
            document.querySelectorAll(".similar-card")
            .forEach(card => {
            card.addEventListener("click", () => {
            getRecipeDetails(card.dataset.id);

            });
            });
            }
        });
    }
async function searchRecipes(query) {
    suggestionsBox.style.display = "none";
    sectionTitle.textContent = "🍽 Search Results";
    const ingredients = query
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");
    try {
        loader.classList.remove("hidden");
        resultsGrid.innerHTML = "";
        resultsGrid.dataset.page = "search";
        messageArea.textContent = "";
        if (ingredients.length === 1) {
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(ingredients[0])}`
            );
            const data = await response.json();
            if (data.meals) {
                displayRecipes(data.meals.slice(0, 6));
            } else {
                messageArea.textContent =
                    "No recipes found. Try another recipe name or ingredient.";
            }
            return;
        }
        let allRecipes = [];
        for (const ingredient of ingredients) {
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
            );
            const data = await response.json();
            if (data.meals) {
                allRecipes.push(...data.meals);
            }
        }
        const uniqueRecipes = allRecipes.filter(
            (recipe, index, self) =>
                index === self.findIndex(
                    item => item.idMeal === recipe.idMeal
                )
        );

        if (uniqueRecipes.length > 0) {
            displayRecipes(uniqueRecipes.slice(0, 6));
        } else {
            messageArea.textContent =
                "No recipes found with these ingredients.";
        }

    } catch (error) {
        console.log(error);

        messageArea.textContent =
            "⚠️ Unable to load recipes. Please check your internet connection.";
    } finally {
        loader.classList.add("hidden");
    }
}
async function loadHomeRecipes() {
    homeLink.classList.add("active");
    favoritesLink.classList.remove("active");
    sectionTitle.classList.remove("favorite-title");
    sectionTitle.textContent = "🍽 Discover Recipes";
    resultsGrid.dataset.page = "home";
    try {
        loader.classList.remove("hidden");
        resultsGrid.innerHTML = "";
        messageArea.textContent = "";
        const recipes = [];
        while (recipes.length < 6) {
            const response = await fetch(
                "https://www.themealdb.com/api/json/v1/1/random.php"
            );
            const data = await response.json();
            const newRecipe = data.meals[0];
            const exists = recipes.some(
                recipe => recipe.idMeal === newRecipe.idMeal
            );
            if (!exists) {
                recipes.push(newRecipe);
            }
        }
        displayRecipes(recipes);
    } catch (error) {
        messageArea.textContent = "Unable to load recipes.";
    } finally {
        loader.classList.add("hidden");
    }
}
async function getRecipeDetails(id) {
    try {
        loader.classList.remove("hidden");
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const data = await response.json();

        if (data.meals) {
            showRecipeModal(data.meals[0]);
        } else {
            messageArea.textContent = "Recipe details not found.";
        }
    } catch (error) {
        console.log(error);
        messageArea.textContent =
            "⚠️ Unable to load recipe details. Please check your internet connection.";
    } finally {
        loader.classList.add("hidden");
    }
}
async function loadSimilarRecipes(category, currentRecipeId) {
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
        );
        const data = await response.json();
        if (!data.meals) {
            return "";
        }
        const similarRecipes = data.meals
            .filter(recipe => recipe.idMeal !== currentRecipeId)
            .slice(0, 3);
        let html = `
            <hr>
            <h3>🍽 Similar Recipes</h3>
            <div class="similar-recipes">
        `;
        similarRecipes.forEach(recipe => {
            html += `
                <div class="similar-card" data-id="${recipe.idMeal}">
                    <img src="${recipe.strMealThumb}" 
                    alt="${recipe.strMeal}">
                    <p>${recipe.strMeal}</p>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    } catch (error) {
        console.log(error);
        return "";
    }
}
function displayRecipes(recipes) {
    if (!recipes) {
        messageArea.textContent = "No recipes found";
        return;
    }
    resultsGrid.innerHTML = "";
    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        const isFavorite = favorites.some(
            fav => fav.idMeal === recipe.idMeal
        );
        let ingredientCount = 0;
        for (let i = 1; i <= 20; i++) {
            if (
                recipe[`strIngredient${i}`] &&
                recipe[`strIngredient${i}`].trim() !== ""
            ) {
                ingredientCount++;
            }
        }
        card.innerHTML = `
<img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
<h3>${recipe.strMeal}</h3>
<div class="recipe-card-info">
<span>🍽 ${recipe.strCategory}</span>
<span>🌍 ${recipe.strArea}</span>
<span>🛒 ${ingredientCount} items</span>
</div>
<div class="view-hint">
    Click to view details
</div>
<button type="button" class="favorite-btn">
${isFavorite ? "♥" : "♡"}
</button>
`;
        const favoriteButton = card.querySelector(".favorite-btn");
        card.addEventListener("click", () => {
            getRecipeDetails(recipe.idMeal);
        });
        favoriteButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFavorite(recipe);
            if (resultsGrid.dataset.page === "favorites") {
                displayRecipes(favorites);
            }
            else {
                const updatedFavorite = favorites.some(
                    fav => fav.idMeal === recipe.idMeal
                );
                favoriteButton.textContent =
                    updatedFavorite ? "♥" : "♡";
                favoriteButton.title =
                    updatedFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites";
            }
        });
        card.dataset.id = recipe.idMeal;
        resultsGrid.appendChild(card);
    });
}
categoryButtons.forEach(button=>{
    button.addEventListener("click",()=>{
        const category = button.dataset.category;
        searchInput.value = category;
        searchByCategory(category);
    });

});
homeLink.addEventListener("click",(event)=>{
    event.preventDefault();
    loadHomeRecipes();
});
favoritesLink.addEventListener("click", async (event) => {
    event.preventDefault();
    await loadFavoritesFromBackend();
    homeLink.classList.remove("active");
    favoritesLink.classList.add("active");
    sectionTitle.classList.add("favorite-title");
    sectionTitle.textContent = "Your Favorite Recipes";
    resultsGrid.dataset.page = "favorites";
    resultsGrid.innerHTML = "";
    messageArea.textContent = "";
    if (favorites.length === 0) {
        sectionTitle.textContent = "";
        messageArea.textContent = "No favorite recipes yet ❤️";
        return;
    }

    displayRecipes(favorites);
});
const themeToggle = document.getElementById("theme-toggle");
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if(document.body.classList.contains("dark-mode")){
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme","dark");
    }else{
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme","light");
    }
});
async function toggleFavorite(recipe) {
    try {
        if (!authToken) {
            messageArea.textContent = "Please login first.";
            return;
        }
        const exists = favorites.some(
            fav => fav.idMeal === recipe.idMeal
        );
        if (exists) {
            const response = await fetch(
                `https://smart-recipe-finder-rfot.onrender.com/api/favorites/${recipe.idMeal}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${authToken}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error("Failed to remove favorite");
            }
            favorites = favorites.filter(
                fav => fav.idMeal !== recipe.idMeal
            );

        } else {
            const response = await fetch(
                "https://smart-recipe-finder-rfot.onrender.com/api/favorites",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    },
                    body: JSON.stringify(recipe)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save favorite");
            }
            const savedFavorite = await response.json();
            favorites.push(savedFavorite);
        }
    } catch (error) {
        console.log("Favorite error:", error);
        messageArea.textContent =
            "⚠️ Unable to update favorite. Please try again.";
    }
}
async function loadFavoritesFromBackend() {
    try {
        if (!authToken) {
            favorites = [];
            console.log("User is not logged in.");
            return;
        }
        const response = await fetch(
            "https://smart-recipe-finder-rfot.onrender.com/api/favorites",
            {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );
        if (!response.ok) {
            throw new Error("Failed to load favorites");
        }
        favorites = await response.json();
        console.log(
            "Favorites loaded from MongoDB:",
            favorites
        );
    } catch (error) {
        console.log("Error loading favorites:", error);
    }
}
if(window.location.search === "?favorites=true"){
    loadFavoritesFromBackend().then(() => {

        homeLink.classList.remove("active");
        favoritesLink.classList.add("active");
        sectionTitle.classList.add("favorite-title");
        sectionTitle.textContent="Your Favorite Recipes";
        resultsGrid.innerHTML="";
        messageArea.textContent="";
        if(favorites.length===0){
            messageArea.textContent="No favorite recipes yet ❤️";
            return;
        }
        displayRecipes(favorites);
    });
}else{
    loadHomeRecipes();
}
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const userWelcome = document.getElementById("user-welcome");
if (authToken) {
    loginBtn.classList.add("hidden");
    registerBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    if (loggedInUser) {
        userWelcome.textContent = `✨ Welcome ${loggedInUser.username} 👋`;      
        userWelcome.classList.remove("hidden");
    }
} else {
    loginBtn.classList.remove("hidden");
    registerBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userWelcome.classList.add("hidden");
}
const authSection = document.getElementById("auth-section");
const authCloseButton = document.getElementById("auth-close-button");
const loginFormContainer = document.getElementById("login-form-container");
const registerFormContainer = document.getElementById("register-form-container");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");
loginBtn.addEventListener("click", () => {
    authSection.classList.remove("hidden");
    loginFormContainer.classList.remove("hidden");
    registerFormContainer.classList.add("hidden");

    loginMessage.textContent = "";
    registerMessage.textContent = "";
});
registerBtn.addEventListener("click", () => {
    authSection.classList.remove("hidden");
    loginFormContainer.classList.add("hidden");
    registerFormContainer.classList.remove("hidden");
    loginMessage.textContent = "";
    registerMessage.textContent = "";
});
authCloseButton.addEventListener("click", () => {
    authSection.classList.add("hidden");
});
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    try {
        const response = await fetch("https://smart-recipe-finder-rfot.onrender.com/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json();
        if (!response.ok) {
            loginMessage.textContent = data.message;
            return;
        }
        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(data.user)
        );
        authToken = data.token;
        loggedInUser = data.user;
        userWelcome.textContent = `✨ Welcome ${loggedInUser.username} 👋`; 
        userWelcome.classList.remove("hidden");
        loginMessage.textContent = "Login successful!";
        messageArea.textContent = "";
        loginBtn.classList.add("hidden");
        registerBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        authSection.classList.add("hidden");
        await loadFavoritesFromBackend();
        console.log("Logged in user:", loggedInUser);

    } catch (error) {
        console.log(error);
        loginMessage.textContent =
            "Unable to login. Please try again.";
    }
});
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username =
        document.getElementById("register-username").value.trim();
    const email =
        document.getElementById("register-email").value.trim();
    const password =
        document.getElementById("register-password").value;
    try {
        const response = await fetch(
            "https://smart-recipe-finder-rfot.onrender.com/api/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            }
        );
        const data = await response.json();
        if (!response.ok) {
            registerMessage.textContent = data.message;
            return;
        }
        registerMessage.textContent =
            "Registration successful! You can now login.";
        registerForm.reset();
    } catch (error) {
        console.log(error);
        registerMessage.textContent =
            "Unable to register. Please try again.";
    }
});
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");
    authToken = null;
    loggedInUser = null;
    favorites = [];
    userWelcome.textContent = "";
    userWelcome.classList.add("hidden");
    resultsGrid.innerHTML = "";
    resultsGrid.dataset.page = "home";
    sectionTitle.textContent = "🍽 Discover Recipes";
    sectionTitle.classList.remove("favorite-title");
    homeLink.classList.add("active");
    favoritesLink.classList.remove("active");
    loginBtn.classList.remove("hidden");
    registerBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    messageArea.textContent =
        "You have been logged out.";
    console.log("User logged out.");
});