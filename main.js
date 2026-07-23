const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const randomButton = document.getElementById("random-button");
const resultsGrid = document.getElementById("results-grid");
const loader = document.getElementById("loader");
const messageArea = document.getElementById("message-area");
const recipeModal = document.getElementById("recipe-modal");
const modalCloseButton = document.getElementById("modal-close-button");
const recipeDetailsContent = document.getElementById("recipe-details-content");
const favoritesLink = document.getElementById("favorites-link");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const suggestionsBox = document.getElementById("suggestions-box");

    let timer;
    searchInput.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
    showSuggestions(searchInput.value.trim());
    },300);
    });
    searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if(searchTerm === ""){
        messageArea.textContent = "Please enter a recipe name";
        return;
    }
    searchRecipes(searchTerm);
     });
    randomButton.addEventListener("click", () => {
    getRandomRecipe();
   });
     modalCloseButton.addEventListener("click", () => {
    recipeModal.classList.add("hidden");
    });
    recipeModal.addEventListener("click", (event) => {
    if(event.target === recipeModal){
        recipeModal.classList.add("hidden");
    }
   });
   document.addEventListener("click",(event)=>{
    if(!suggestionsBox.contains(event.target)
    && event.target!==searchInput){
        suggestionsBox.style.display="none";
    }
    });
    function showRecipeModal(recipe) {
    recipeDetailsContent.innerHTML = `
        <h2>${recipe.strMeal}</h2>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        <p><strong>Category:</strong> ${recipe.strCategory}</p>
        <p><strong>Area:</strong> ${recipe.strArea}</p>
        <h3>Instructions</h3>
        <p>${recipe.strInstructions}</p>
    `;
    recipeModal.classList.remove("hidden");
    }
    async function showSuggestions(query){
    if(query.length < 2){
        suggestionsBox.style.display = "none";
        return;
    }
    try{
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        suggestionsBox.innerHTML = "";
        if(!data.meals){
            suggestionsBox.style.display = "none";
            return;
        }
        data.meals.slice(0,5).forEach(recipe=>{
            const item=document.createElement("div");
            item.classList.add("suggestion-item");
            item.textContent=recipe.strMeal;
            item.addEventListener("click",()=>{
                searchInput.value=recipe.strMeal;
                suggestionsBox.style.display="none";
                searchRecipes(recipe.strMeal);
            });
            suggestionsBox.appendChild(item);
        });
        suggestionsBox.style.display="block";
    }catch(error){
        console.log(error);
        suggestionsBox.style.display="none";
    }
}
    async function searchRecipes(query){

    try{
        loader.classList.remove("hidden");
        resultsGrid.innerHTML = "";
        resultsGrid.dataset.page = "search";
        messageArea.textContent = "";
        const lowerQuery = query.toLowerCase();
        let searchTerms = [query];
        const words = query.split(" ");
        if(words.length > 1){
            searchTerms.push(words[0]);
            searchTerms.push(words[words.length - 1]);
        }
        let allRecipes = [];
        let exactMatchFound = false;
        for(let term of searchTerms){
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`
            );
            const data = await response.json();
            if(data.meals){
                allRecipes.push(...data.meals);
            }
        }
        allRecipes.forEach(recipe => {
        if(recipe.strMeal.toLowerCase()
       .includes(lowerQuery)){
        exactMatchFound = true;
       }
      });
        allRecipes = allRecipes.filter(
            (recipe,index,self)=>
            index === self.findIndex(
                r => r.idMeal === recipe.idMeal
            )
        );
    allRecipes.sort((a,b)=>{
    const aName = a.strMeal.toLowerCase();
    const bName = b.strMeal.toLowerCase();
    let aScore = 0;
    let bScore = 0;
    words.forEach(word=>{
        if(aName.includes(word.toLowerCase())){
            aScore++;
        }
        if(bName.includes(word.toLowerCase())){
            bScore++;
        }
    });
    return bScore - aScore;
   });
   allRecipes = allRecipes.slice(0,6);

    if(allRecipes.length > 0){
    if(exactMatchFound){
    messageArea.textContent = "";
     }else{
        messageArea.innerHTML =
        `
        <div class="search-info-message">
       🔍 No exact recipe found for "<strong>${query}</strong>".<br>
        Showing similar recipes you might like:
        </div>
        `;}
    displayRecipes(allRecipes);
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
    async function getRandomRecipe(){
    try{
        loader.classList.remove("hidden");
        resultsGrid.innerHTML = "";
        resultsGrid.dataset.page = "search";
        messageArea.textContent = "";
        const response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        if(!response.ok){
            throw new Error("Failed to fetch random recipe");
        }
        const data = await response.json();
        displayRecipes(data.meals);
    }catch(error){
        console.log(error);
        messageArea.textContent =
        "⚠️Unable to get a random recipe. Please try again.";
    }
    finally{
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
        showRecipeModal(data.meals[0]);
    } catch (error) {
        messageArea.textContent = "Unable to load recipe details.";
    } finally {
        loader.classList.add("hidden");
    }
     }
    function displayRecipes(recipes){
    if(!recipes){
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
        card.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3>${recipe.strMeal}</h3>
            <button class="favorite-btn" title="${isFavorite ? "Remove from Favorites" : "Add to Favorites"}">
            ${isFavorite ? "♥" : "♡"}
            </button>
        `;
        const favoriteButton = card.querySelector(".favorite-btn");
        favoriteButton.addEventListener("click",(event)=>{
        event.stopPropagation();
        toggleFavorite(recipe);
        if(resultsGrid.dataset.page === "favorites"){
        displayRecipes(favorites);
         }
        else{
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
        card.addEventListener("click",()=>{
            getRecipeDetails(recipe.idMeal);
        });
        resultsGrid.appendChild(card);
    });
     }   
    favoritesLink.addEventListener("click",(event)=>{
    event.preventDefault();
    resultsGrid.dataset.page = "favorites";
    if(favorites.length === 0){
        resultsGrid.innerHTML = "";
        messageArea.textContent =
        "No favorite recipes yet ❤️";
        return;
    }
    messageArea.textContent = "";
    displayRecipes(favorites);
     });
    function toggleFavorite(recipe){
    const exists = favorites.find(
        fav => fav.idMeal === recipe.idMeal
       );
        if(exists){
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