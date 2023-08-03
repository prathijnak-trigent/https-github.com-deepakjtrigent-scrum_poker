Scrum-Poker Web Application

Introduction

Scrum-Poker is an Agile planning and estimating technique that allows teams to assess the time required to complete stories in a sprint. This real-time Scrum-Poker web application is built using Angular, and it utilizes WebSockets for instant data updates between clients and the server.

Technologies Used

- Angular v16.1.6
- Angular Material v16.1.6
- Tailwind CSS v3.3.3

Getting Started

To run this application locally on your machine, follow these steps:

1. Clone this repository to your local machine:
   git clone <url>
   Using https: https://github.com/deepakjtrigent/scrum_poker.git
   Using ssh: git@github.com:deepakjtrigent/scrum_poker.git

2. Navigate to the project folder:
   cd scrum_poker/FE

3. Install the dependencies using npm:
   npm install

4. Start the development server:
   ng serve

5. Open your web browser and go to `http://localhost:4200` to access the application.

Folder Structure

`src/app/landing-page`: Contains the initial landing page component.
`src/app/shared/services/storage.service`: Provides a service for fetching data from components and storing it efficiently.
`src/app/app-routing.module`: Handles the routing in the app, enabling seamless navigation between different components.

Scrum-Poker: An Overview

Scrum-Poker, also known as Planning Poker, is a consensus-based Agile planning and estimating technique. Team members use physical cards resembling playing cards to estimate the effort needed to complete each task or story in a sprint. This app facilitates the process in a real-time collaborative environment, thanks to WebSockets.

WebSocket Communication

The application establishes a WebSocket connection to the server using the URL `ws://localhost:8000/ws`. This WebSocket allows real-time communication between the client and the server, enabling instant data updates.





BACKEND STRUCTURE

## Building Scrum Poker with WebSockets for Instant Data Updates - Backend

This project focuses on creating a Scrum Poker web application using Angular as the frontend framework and WebSockets for real-time communication between the client and the server. Scrum Poker, also known as "Planning Poker," is an Agile planning and estimating technique used to determine the time and effort required to complete user stories within a sprint. Participants use cards resembling playing cards to indicate their estimates.


## Features


## Getting Started

1. **Clone the Repository**
```bash
git clone git@github.com:deepakjtrigent/scrum_poker.git

## Install and usage
1. **Navigate to the cloned directory**

    ```bash
    cd PokerBE/BE
    ```

2. **Install dependencies**

    ```bash
    pip install -r requirements.txt
    ```

3. **Run the server**

    ```bash
    uvicorn app:app --reload


4. **Go to browser**   
     ```
        Open your web browser and go to `http://localhost:8000` to access the application.



Your server is now up and running and ready to serve mock data!
