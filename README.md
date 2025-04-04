# Group 7 Trinity Transit

## Overview

Trinity Transit is a timetabling transport app that pulls realtime transit information to enhance student's commutes. 

### Key Features:

**Real-Time Location Integration:** Using Expo's location services, TrinityTransit asks the user for their location and can reverse geocodes their address. This location is used with Google Maps API to plan routes to their destination.

**SQL Database:** User data is saved in the docker desktop container SQL database. Allowing the user to have a personalised experience. 

**Interactive Mapping:** The app displays an interactive map (the user's default) featuring nearby bus stops, nearby buses, and dynamic route markers. This allows users to quickly locate stops and visualise their journey, enhancing overall navigation.

**Mape Page:** The map page displays the above and also allows the user to access their saved routes, edit saved buses and edit saved bus stops.

**Personalisation:** The profile page allows the user to edit their details, favourited destinations and favourite transport providers to have a personalised experience.

**API's:** TrinityTransit utilises a Google Maps API for location, routing, place and directional data. The GTFS and GTFS-R API's are used in conjunction to provide and decode realtime transit data.

**Timetable & Trip Updates:** TrinityTransit offers real-time trip updates, including delays and schedule changes. This feature keeps users informed about their bus routes, helping them adjust their plans on the fly.

**Home Page:** The modern style home page welcomes the user and shows realtime updates on their journeys. 

**Destination Search & Route Planning:** With a built-in search function, users can enter a destination to receive detailed route instructions. The app integrates geocoding and route fetching from a backend service, providing clear directions.

**Intuitive Navigation & UI:** The application boasts a clean, modern interface with features like a bottom navigation bar with recognisable icons and a easy to navigate app structure. 

**State Persistence:** To enhance user experience, recent searches and selected routes are saved using persistent storage. This allows users to pick up right where they left off during their previous session. For convenience the user's saved details are displayed in drop down menues. 

**Camera Integration:** The application asks for the user's media access permissions. Once granted, users can take photos to document their commute. These photos can be inspected on the gallery page, enlarged and add description lables to them.

**Page Refresh:** using expo libraary, the app can be refreshed by pulling down on the screen.

## Step by Step

### Set up

Install Docker Desktop.

Install the [ExpoGO App](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_IE) on your mobile device.

Install the [ngrok api](https://dashboard.ngrok.com/get-started/setup/windows) on your laptop and create a **free account**.

Run the **ngrok.exe** and enter the command 

```bash
   ngrok http 8080
   ```

This runs a forwarding api server allowing the two seperate devices to communicate.

Take the Forwarding address from the ngrok terminal. It will look similar to: https://414d-134-226-213-136.ngrok-free.app

- **Note:** Due to the free account this address will change each time the ngrok server is started.

Add this forwarding address to **config.ts** in the route directory.

- **Edit the line:** export const `BACKEND_URL = 'https://ca71-134-226-213-136.ngrok-free.app'"` to contain the address from the currently running ngrok.
server.

In a terminal in the project directory to install the project dependencies run the command:

```bash
   npm install
   ```

*Set up is complete.*

### Running

Open Docker Desktop, make sure it is running.

Run BackendApplication.java

Run the command in the expo terminal to start the mobile app.

```bash
   npx expo start -c
   ```

A QR code will display in the terminal.

On the ExpoGo App on your mobile phone, scan the QR code and wait for the app to build.

*The app is now running on the phone*

### Backends

The backend comprises of a docker container SQL database with multiple tables to store data and a SpringBoot application with controllers, services, JPARepositories and entities to replicate and communicate with the SQL database tables via API requests.

The application interacts with the Google Maps Places API for locations and the GTFS-R API for transport information.

The console provides detailed logs. 

### To view the SQL database backend:

Go to Docker desktop.

Select the sweng-g7 database.

Go to the "Exec" Tab and enter the following SQL commands:

```bash
   mysql -p
   ```
Enter password:

   ```bash
   root
   ```

Enter the database:

   ```bash
   USE trinity_transit;
   ```
View database structure:

   ```bash
   SHOW TABLES;
   ```

Use SQL commands to inspect the tables contents. Examples:

```bash
   SLECT * FROM photo;
   ```

```bash
   SELECT * FROM personal_details;
   ```

```bash
   mysql> SELECT * FROM buses;
   ```

etc.


### Github Usernames

See GitHub for contributions. 

1. **Colm Buttimer:** Colm2002, buttimec
2. **Dennis Kogan:** kogandg
3. **Minghim Foun (Oscar):** ShinaoK
4. **Alexander O'Connor:** alexoc123
5. **Aran Quintana:** Aranq13 

## Sites and Github References

See Jira scrum meeting attendance record since Release 1: https://tcd-sweng-g7.atlassian.net/wiki/spaces/SCRUM/pages/11862018/Regular+Scrum+Meetings+Agreement

## Sites and Github References

Took inspiration from https://github.com/adrianhajdin/uber to access phone's location.

Expo Documentation on camera access: https://docs.expo.dev/versions/latest/sdk/camera/
