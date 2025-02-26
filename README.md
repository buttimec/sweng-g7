# Group 7 Trinity Transit

## Overview

### Key Features:

**Real-Time Location Integration:** Using Expo's location services, TrinityTransit asks the user for their location and can reverse geocodes their address.

**Interactive Mapping:** The app displays an interactive map (the user's default) featuring nearby bus stops and dynamic route markers. This allows users to quickly locate stops and visualize their journey, enhancing overall navigation.

**API's:** TrinityTransit utilises a Google Maps API for location, routing, place and directional data. The GTFS and GTFS-R API's are used in conjunction to provide and decode realtime transit data.

**Timetable & Trip Updates:** TrinityTransit offers real-time trip updates, including delays and schedule changes. This feature keeps users informed about their bus routes, helping them adjust their plans on the fly.

**Destination Search & Route Planning:** With a built-in search function, users can enter a destination to receive detailed route instructions. The app integrates geocoding and route fetching from a backend service, providing clear directions.

**Intuitive Navigation & UI:** The application boasts a clean, modern interface with features like a bottom navigation bar and a convenient back arrow in headers to easily return to the home screen. Frontend UI will be updated in Sprint 3 and 4.

**State Persistence:** To enhance user experience, recent searches and selected routes are saved using persistent storage. This allows users to pick up right where they left off during their previous session.

## Step by Step

### Set up

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

Run BackendApplication.java

Run the command in the expo terminal to start the mobile app.

```bash
   npx expo start -c
   ```

A QR code will display in the terminal.

On the ExpoGo App on your mobile phone, scan the QR code and wait for the app to build.

*The app is now running on the phone*

### Backends

Backend consists of a SpringBoot application and 2 controllers to handle API calls from Google Maps and GTFS-R.


### Github Usernames

1. **Colm Buttimer:** Colm2002, buttimec
2. **Dennis Kogan:** kogandg
3. **Minghim Foun (Oscar):** ShinaoK
4. **Alexander O'Connor:** alexoc123
5. **Aran Quintana:** Aranq13
6. **Brian Sharkey:** Brian-school 



## Sites and Github References

Took inspiration from https://github.com/adrianhajdin/uber to access phone's location