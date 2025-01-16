# Website for Car Repair Shop

Creating a unique car repair shop website, where users can easily navigate through the information and functions we offer.

---

## Table of Contents
1. [All Pages](#all-pages)
    - [Home Page](#home-page)
    - [Services Page](#services-page)
    - [About Us Page](#about-us-page)
    - [Price Estimator Page](#price-estimator-page)
    - [Booking Appointments Page](#booking-appointments-page)
    - [Own Appointments Page](#own-appointments-page)
    - [Profile Page](#profile-page)
    - [Notification Settings Page](#notification-settings-page)
    - [Worker Page](#worker-page)
    - [Admin Panel](#admin-panel)
    - [Statistics Page](#statistics-page)
2. [How to Run the Project](#how-to-run-the-project)
    - [Step 1: Install Necessary Technologies](#step-1-install-necessary-technologies)
    - [Step 2: Set Up the Frontend](#step-2-set-up-the-frontend)
    - [Step 3: Set Up the Database](#step-3-set-up-the-database)
3. [Functionality](#functionality)
4. [Used Technologies](#used-technologies)
5. [🛠 Skills](#🛠-skills)
6. [To Do](#to-do)

---

## All Pages

### Home Page
The landing page of the website, providing quick navigation to all features.
![image](https://github.com/user-attachments/assets/9a9e9811-f252-4ee2-a9b2-5e71c0ac6413)

---

### Services Page
Showcases all services offered by the shop in a user-friendly format.
![image](https://github.com/user-attachments/assets/0be05c93-d850-46d7-8b43-e22cfb807261)

---

### About Us Page
Information about the shop, its mission, and the team behind it.
![image](https://github.com/user-attachments/assets/deb980ef-f741-4640-83dd-b555c9b5bfd1)

---

### Price Estimator Page
An interactive tool allowing users to estimate costs for specific services.
![image](https://github.com/user-attachments/assets/d5861662-b093-445e-863f-eae44fe83beb)

---

### Booking Appointments Page
A seamless way for customers to book appointments online.
![image](https://github.com/user-attachments/assets/0c395648-0266-49cb-9f04-886c90e75357)

---

### Own Appointments Page
A page for logged-in users to manage their scheduled appointments.
![image](https://github.com/user-attachments/assets/051e8bce-3994-485a-9d40-04ceec9ffb80)

---

### Profile Page
Manage account details and update personal information securely.
![image](https://github.com/user-attachments/assets/07bb9f94-b860-43d2-b32f-115ce18f8d29)

---

### Notification Settings Page
Allows users to customize their notification preferences for reminders and special deals.
![image](https://github.com/user-attachments/assets/db1ea554-5411-431e-b1f3-a7bf46a0cf86)

---

### Worker Page
Dedicated to workers for managing and viewing repair tasks.
![image](https://github.com/user-attachments/assets/f5464da9-e2a4-46c4-8438-e95d3d2a0ea9)

---

### Admin Panel
Provides administrators with tools to manage users and projects.
![image](https://github.com/user-attachments/assets/23224693-b8db-4b0d-8911-862b2ac87389)

---

### Statistics Page
Displays detailed performance and usage statistics for administrators.
![image](https://github.com/user-attachments/assets/787ed149-3147-4b58-b624-61c2300dbbdf)

---

## How to Run the Project

### Step 1: Install Necessary Technologies
1. Download and install the following:
   - **MySQL 8.0** database.
   - **Visual Studio Code** (or another IDE).
   - **Node.js**.

   *Tip*: You may need to run PowerShell as admin and execute `Set-ExecutionPolicy RemoteSigned`.

---

### Step 2: Set Up the Frontend
1. Download the repository as a ZIP file.
2. Unzip the folder.
3. Open the folder with Visual Studio Code (or another IDE).

---

### Step 3: Set Up the Database
1. Open **MySQL Workbench**.
2. Run your local MySQL instance and check your username and password.
3. Create a database schema named `carrepairshop`, or update the `.env` file with an existing database name.
4. Update `.env` file (in `./Correctly_structured_project`) with your MySQL username and password.
5. Open the terminal in your IDE (under `./CarRepairShop/src`) and run:
```npx knex migrate:latest --knexfile ./knexfile.cjs```
and then ``` npx knex seed:run --knexfile ./knexfile.cjs```;
7. Then, finally run `node app.js`;
8. Visit `localhost` in your browser to start the website.

---

## Functionality

### Instant Functions
- Services page neatly displays all offered services.
- Map location and navigation.
- Log-in and Sign-up functionality.

### Functions Unlocked on Log-in
- Online price estimator with an interactive car layout.
- Unique offers and reminders for registered users.
- Account management (update information, change password).

### Functions for Admins
- View all users and projects.
- Manage users (delete, view projects, identify bots).
- Update project deadlines and statuses.

---

## Used Technologies
- **MySQL 8.0** database
- **Node.js**, **Express.js**
- **HTML**, **EJS**, **CSS**
- **Bootstrap**

---

## 🛠 Skills
JavaScript, HTML, CSS...

---

## TO DO
- [x] Allow admins to add workers and administrators.
- [x] Create a worker page for managing projects.
- [ ] Add a light mode theme.
- [ ] Implement password reset via email.
- [ ] Add notification settings for email reminders.
- [ ] Improve database structure and documentation.
