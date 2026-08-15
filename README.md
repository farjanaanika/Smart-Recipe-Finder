```markdown
# 🍽 Smart Recipe Finder

Smart Recipe Finder is a full-stack web application that helps users discover recipes, search by recipe name or ingredients, browse recipes by category, view detailed cooking instructions, and save their favorite recipes.

## ✨ Features

- 🔍 Search recipes by name
- 🥕 Search recipes by ingredients
- 🍽 Browse recipes by category
- 💡 Recipe search suggestions
- 📖 View detailed recipe information
- 🍴 View similar recipes
- ❤️ Add and remove favorite recipes
- 🔐 User registration and login
- 👤 User-specific favorite recipes
- 🚪 Logout functionality
- 🌙 Dark mode
- 📱 Responsive design
- 🌐 Recipe data powered by TheMealDB API

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome
- TheMealDB API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- CORS

## 📁 Project Structure

```text
Smart-Recipe-Finder/
│
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── style.css
│   └── main.js
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── models/
│       ├── User.js
│       └── Favorite.js
│
├── .gitignore
└── README.md
```

## ⚙️ How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/farjanaanika/Smart-Recipe-Finder.git
```

### 2. Open the Project

```bash
cd Smart-Recipe-Finder
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Make Sure MongoDB Is Running

The application uses MongoDB with the database:

```text
smartRecipeFinder
```

### 5. Start the Backend

Inside the backend folder, run:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open the frontend folder and run:

```text
frontend/index.html
```

You can use **VS Code Live Server** to run the frontend locally.

## 🔐 Authentication

Users can:

1. Create an account
2. Log in
3. Save recipes to their favorites
4. View their saved recipes
5. Remove favorite recipes
6. Log out

Authentication is handled using **JSON Web Tokens (JWT)**.

## ❤️ Favorites

Favorite recipes are stored in **MongoDB** rather than only in browser local storage.

Each user's favorite recipes are associated with their authenticated user ID, so users can only see their own saved recipes.

## 🌐 Recipe API

Recipe information is provided by **TheMealDB API**.

The application uses TheMealDB to retrieve:

* Recipe names
* Recipe images
* Categories
* Areas/Cuisines
* Ingredients
* Cooking instructions
* YouTube recipe links
* Similar recipes

## 🎨 User Interface

The application includes:

* 🍽 Modern recipe cards
* 🔍 Smart recipe search
* 🥕 Ingredient-based search
* 📂 Category filtering
* 📖 Recipe details modal
* 🍴 Similar recipes
* ❤️ Favorites section
* 🔐 Login and registration
* 👤 User welcome message
* 🚪 Logout functionality
* 🌙 Dark mode
* 📱 Responsive design

## 🚀 Future Improvements

Possible future improvements include:

* 🔒 Password hashing with bcrypt
* 👤 User profile management
* ⭐ Recipe ratings and reviews
* 💬 User comments
* 🤖 Personalized recipe recommendations
* 🔎 Improved search accuracy
* ☁️ Cloud database integration
* 🌐 Deployment to a production server

## 👩‍💻 Author

**Farjana Jahan Anika**

Computer Science & Engineering Student

## 📄 License

This project was created for educational purposes.

---

⭐ **If you like this project, feel free to star the repository!**

````
