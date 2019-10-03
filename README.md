# food-recipes-rest-api
Simple Node.js Rest API application for sharing food recipes.
Application supports user authentication and manipulation with recipes and their categories.
Application utilises NoSQL MongoDB services for persisting data, and Claudinary services for storing and serving image files.

----------

Suported resources are user, recipe and category.

User endpoints:
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
POST /user/signup - registers a new user. Body of request should consist of following parameters:
    - email (required): email of new user.
    - password (required): password for new user.
    - firstName (required): first name of new user.
    - lastName (required): last name of new user.
POST /user/login - logs in the user. Body of request should consist of following parameters:
    - email (required): email of user.
    - password (required): password for user.
GET /user//add-recipe-to-favorites/{recipeId} - adds the selected recipe to logged in user's favorite recipes. URL parameter represent the id of favourited recipe.

Recipe endpoints:
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
POST /recipe/add-recipe - creates a new recipe. Body of request consist of fields for new recipe:
    - name (required): name of new recipe. Should be unique.
    - description (required): a description how to prepare the recipe.
    - ingredients: array of objects consisting of:
        - name (required): name of ingridient.
        - measure (required): amount of ingridient.
    - category (required): id of category.
    - image: image file that will be uploaded.
    - video: url of tutorial video.
PUT /recipe/edit-recipe/{recipeId} - edits the selected recipe. URL parameter represent the id of edited recipe. Similarly to add-recipe, body of request can have following parameters:
    - name (required): new name for selected recipe.
    - description (required): a description how to prepare the recipe.
    - ingredients: array of objects consisting of:
        - name (required): name of ingridient.
        - measure (required): amount of ingridient.
    - category (required): id of category.
    - image: image file that will be uploaded.
    - video: url of tutorial video.
DELETE /recipe/delete-recipe/{recipeId} - deletes the selected recipe. Url parameter represents the id of recipe that is requested to be deleted.
GET /recipe/get-recipes - gets all existing recipes from the database.
GET /recipe/get-recipe/{recipeId} - gets data for selected recipe. Url parameter represents the selected recipe's id.

Category endpoints:
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
POST /category/add-category - adds a new category. Body of request should consist of following parameters:
    - name (required): a name of new category.
    - image: image file that will be uploaded.
PUT /category/edit-category/{categoryId} - edits the selected category. URL parameter represent the id of edited category. Similarly to add-category, body of request can have following parameters:
    - name (required): a name of new category.
    - image: image file that will be uploaded.
DELETE /category/delete-category/{categoryId} - deletes the selected category. Url parameter represents the id of category that is requested to be deleted.
GET /category/get-categories - gets all existing categories from the database.
GET /category/get-category/{categoryId} - gets all recipes belonging to selected category. Url parameter represents the selected category's id.

----------
Following environment variables need to be set:

MONGODB_CONNECTION_STRING (string for connecting to MongoDB services)
NODE_ENV (should be set to development or production)
PORT (chose at which port server will accept requests)
JWT_SEED (should be a long secret random string)
CLOUDINARY_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

They can be kept in .env file, when running application in development mode.