
# Website for car repair shop

Creating a unique car repair shop website, where users can neately move between information and functions that we offer.

How to run the project:
- 
```
1. Download all the neccesary technoligies:
    1. MySQL 8.0 database;
    2. Visual studio code, with the Live Server extention;
    3. Node.js
```
```
2. Download the repository as zip;

3. Uzip the folder;

4. Run the folder with visual studio code;

5. Open Home.html with live server;
```
That finishes the frontend setup, now you need to set up the database.
```
6. To start with the database, run MySQL workbench;

7. Run your local instance of MySQL and make a new query;

8. Go back to the project folder, theres a folder there called Database_code,
first copy the code in Core_database.sql and paste it in the query you made and run it;

9. Then back in the folder open the Dump sql file and copy the code there,
replace the code in the query with that and run it again;

10. Now make sure your local database instance is running and check the password you have for it;

11. Go back to visual studio code and open Database.js (its in ./botstrap-5.3.2-dist./js folder)
find where it says password: "root", and change "root" to your instance password
leave empty if you dont have a paswword for it;

12. Then open a terminal in visual studio code, write 'cd ./bootstrap-5.3.2-dist/js' and then 'node Database.js'
````
Now go back to the web page and the database should be up and running.

  
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
- HTML/NodeJS
- Bootstrap


## 🛠 Skills
Javascript, HTML, CSS...

## TO DO
- [x] Give admins the ability to add workers and administrators;
- [x] Make a worker page where workers can see project information;
- [ ] Possibly add light mode;
- [ ] If i can be bothered add password reset through email, with that also notifications for users, about deals, sales and other reminders;

