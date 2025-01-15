


# Website for car repair shop

Creating a unique car repair shop website, where users can neately move between information and functions that we offer.

# Home page
![image](https://github.com/user-attachments/assets/c22de027-7ed9-42b3-9a4e-8a1a29de95a8)

# Price estimator page
![image](https://github.com/user-attachments/assets/5f9b21fa-87fd-4c00-bcbb-e1c13840bdaf)


# Booking appointments page
![image](https://github.com/user-attachments/assets/ad9176f4-797a-49dd-a322-6149601589c5)

# Admin pannel
![image](https://github.com/user-attachments/assets/47b1e5d6-9713-4a3e-a3c3-f09c7fd3d50a)


How to run the project:
- 
```
1. Download all the neccesary technoligies:
    1. MySQL 8.0 database;
    2. Visual studio code or other IDE;
    3. Node.js
    (Might need to run Powershell as admin and run "Set-ExecutionPolicy RemoteSigned")
```
```
2. Download the repository as zip;

3. Uzip the folder;

4. Run the folder with visual studio code or other IDE;

```
That finishes the frontend setup, now you need to set up the database.
```
5. To start with the database, run MySQL workbench;

6. Run your local instance of MySQL and check the username and password you have for it;

7. Create a database scheme named "carrepairshop", or change the .env database name to an exsisting one;

8. Go back to visual studio code, or other and open .env  (its in ./Correctly_structured_project folder)
find where it says password: "root", and change "root" to your instance password
leave empty if you dont have a paswword for it;

9. Open terminal in the IDE and run the command "npx knex migrate:latest --knexfile ./knexfile.cjs" and then "npx knex seed:run --knexfile ./knexfile.cjs" to generate the database data;
12. Then open a terminal in visual studio code, write 'cd ./correctly_structured_project/src' and then 'node app.js'
````
Now go back to the web page and the database should be up and running at localhost.

  
# Functionality 
Instant functions will include:
- 
- Services page that neately displays all offered services;
- Map location;
- Log-in and Sign-up.
  
Functions unlocked on Log-in include:
- 
   - Online price estimator with integrated layout of a car, for users to select parts required to be painted;
   - Unique offers for customers using the information from the Sign-up, users can choose to recieve these unique offers and reminders of things like oil change;
   - Ability to view account info and change password if needed within a seperate page.
  
Functions for admin:
-
  - Ability to view all users (All, all active and view users by ID or Username);
  - View projects (All, all delayed and view projects by ID or User);
  - While viewing users ability to delete them, view projects associated with them or view similar users in case of botting;
  - While viewing projects ability to change end date, view user associated with the project and view delayed projects.

## Used technoligies

- MySQL 8.0 database
- NodeJS, Express
- HTML/NodeJS/EJS
- Bootstrap


## 🛠 Skills
Javascript, HTML, CSS...

## TO DO
- [x] Give admins the ability to add workers and administrators;
- [x] Make a worker page where workers can see project information;
- [ ] Possibly add light mode;
- [ ] If i can be bothered add password reset through email, with that also notifications for users, about deals, sales and other reminders;
- [ ] Add notification settings in database (so we can easily see if the user is opted in or out of notifs and send email reminders, etc. to only opted in users instantly, with just a simple query)
- [ ] Fix database and documentation

