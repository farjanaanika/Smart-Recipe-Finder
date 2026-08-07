const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsGrid = document.getElementById("results-grid");
const loader = document.getElementById("loader");
const messageArea = document.getElementById("message-area");
const recipeModal = document.getElementById("recipe-modal");
const modalCloseButton = document.getElementById("modal-close-button");
const recipeDetailsContent = document.getElementById("recipe-details-content");
const favoritesLink = document.getElementById("favorites-link");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const suggestionsBox = document.getElementById("suggestions-box");
const categoryButtons = document.querySelectorAll(".category-btn");
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
        messageArea.textContent = "Please enter a recipe name";
        return;
    }
    searchRecipes(searchTerm);
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
async function searchRecipes(query){
    suggestionsBox.style.display="none";
    try{
        loader.classList.remove("hidden");
        resultsGrid.innerHTML="";
        resultsGrid.dataset.page="search";
        messageArea.textContent="";
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if(data.meals){
            displayRecipes(data.meals.slice(0,6));
        }else{
            messageArea.textContent =
            "No recipes found. Try another recipe name.";
        }
    }catch(error){
        console.log(error);
        messageArea.textContent =
        "⚠️ Unable to load recipes. Please check your internet connection.";

    }
    finally{
        loader.classList.add("hidden");

    }
}
async function loadHomeRecipes() {
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
<button class="favorite-btn">
${isFavorite ? "♥" : "♡"}
</button>
`;
        const favoriteButton = card.querySelector(".favorite-btn");
        card.addEventListener("click", () => {
            getRecipeDetails(recipe.idMeal);
        });
        favoriteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleFavorite(recipe);
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
favoritesLink.addEventListener("click", (event) => {
    event.preventDefault();
    resultsGrid.dataset.page = "favorites";
    if (favorites.length === 0) {
        resultsGrid.innerHTML = "";
        messageArea.textContent =
            "No favorite recipes yet ❤️";
        return;
    }
    messageArea.textContent = "";
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
function toggleFavorite(recipe) {
    const exists = favorites.find(
        fav => fav.idMeal === recipe.idMeal
    );
    if (exists) {
        favorites = favorites.filter(
            fav => fav.idMeal !== recipe.idMeal
        );
    } else {
        favorites.push(recipe);
    }
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
}
loadHomeRecipes();