#Interactive User Relationship & Hobby Network

#Project Description

The Interactive Friendship Network MERN App is a full-stack web application that enables users to create profiles, manage hobbies, and form friendships all visualized dynamically through an interactive graph powered by React Flow.

Users can:
- Create, update, and delete user profiles with details such as name, age, and hobbies.
- Add hobbies that reflect shared interests.
- Link and unlink friendships between users.
- View all users and their connections through a graph visualization.
- Track dynamic popularity scores that update automatically based on friendships and shared hobbies.
- See real-time visual changes in the graph where node size and color intensity reflect user popularity.

Built using the MERN Stack (MongoDB, Express, React, Node.js) with TypeScript, this project provides an engaging and data-driven interface to understand user relationships and shared interests.

---

#Setup and Execution Instructions

#Project Setup

#1. Clone the repository
#2. Backend Setup: 
cd backend
npm install

Create a .env file inside the backend directory:
MONGO_URI=your_mongodb_connection_string
PORT=5000

Start the backend server:
npm run dev

The backend will start at:
👉 http://localhost:5000

#3. Frontend Setup
cd frontend
npm install

Start the frontend server:
npm run dev

The frontend will start at:
👉 http://localhost:5173

---

#Running the Application

#1. Create Users

-Click “Create User” and fill in details (Username, Age).
-Each created user appears as a node on the graph.

#2. Manage Hobbies

-Use the Sidebar to browse or add new hobbies.
-Drag and drop hobbies from the sidebar onto a user node to assign them.
-Users sharing hobbies become more connected through their popularity score.

#3. Build Friendships

-Connect two nodes directly on the graph to create a friendship.
-Use the Unlink option in the user panel to remove friendships.
-The graph refreshes dynamically after every action.

#4. Visualize Popularity

-Node size and color intensity change according to each user’s popularity.
-Popularity Score Formula: Popularity = (Number of unique friends) + (Number of shared hobbies × 0.5)
-Any update to hobbies or relationships instantly reflects on the graph.

---

env.example: (Inside the backend folder)

---

#API Documentation

The backend provides a RESTful API to manage users, friendships, and hobbies — as well as to serve data for frontend graph visualization.
All routes are prefixed with: /api

1. POST /api/users : Creates a new user with `name` and `age`.
Response: {
  "message": "User created successfully",
  "user": {
    "_id": "67112d9f4c5e9a9e3b6e12e3",
    "name": "Abhishek",
    "age": 25,
    "hobbies": [],
    "friends": [],
    "popularityScore": 0
  }
}

2. GET /api/users : Fetches a list of all users, including their hobbies, friends, and popularity scores.
Response: {
  "users": [
    {
      "_id": "67112d9f4c5e9a9e3b6e12e3",
      "name": "Abhishek",
      "age": 25,
      "hobbies": ["music", "reading"],
      "friends": ["67112d9f4c5e9a9e3b6e12f1"],
      "popularityScore": 2.5
    }
  ]
}

3. PUT /api/users/:id : Updates user details (e.g., name, age).
Response: {
  "message": "User updated successfully",
  "user": {
    "_id": "67112d9f4c5e9a9e3b6e12e3",
    "name": "Abhishek Kumar",
    "age": 26
  }
}

4. DELETE /api/users/:id : Removes a user from the database and automatically updates related friendships.
Response: {
  "message": "User deleted successfully"
}

5. POST /api/users/:id/link : Links two users as friends and recalculates their popularity scores.
Response: {
  "message": "Users linked successfully",
  "user1": {
    "_id": "67112d9f4c5e9a9e3b6e12e3",
    "friends": ["67112e004c5e9a9e3b6e12f1"],
    "popularityScore": 3.0
  },
  "user2": {
    "_id": "67112e004c5e9a9e3b6e12f1",
    "friends": ["67112d9f4c5e9a9e3b6e12e3"],
    "popularityScore": 2.5
  }
}

6. DELETE /api/users/:id/unlink : Removes friendship between two users.
Response: {
  "message": "Users unlinked successfully"
}

7. PUT /api/users/:id/hobby : Adds a hobby to a user and updates popularity accordingly.
Response: {
  "message": "Hobby added",
  "user": {
    "_id": "67112d9f4c5e9a9e3b6e12e3",
    "hobbies": ["music", "gaming"],
    "popularityScore": 3.5
  }
}

8. GET /api/graph : Returns all nodes (users) and edges (friendships) for frontend graph visualization.
Response: {
  "nodes": [
    { "id": "67112d9f4c5e9a9e3b6e12e3", "label": "Abhishek (25)", "popularityScore": 3.5 },
    { "id": "67112e004c5e9a9e3b6e12f1", "label": "Akash (26)", "popularityScore": 2.0 }
  ],
  "edges": [
    { "source": "67112d9f4c5e9a9e3b6e12e3", "target": "67112e004c5e9a9e3b6e12f1" }
  ]
}

---

#Demo Video

Watch the full working demo here:  
Google Drive Link: https://drive.google.com/file/d/13pJW_wzc_xGNu9e0S4Pifk5DoAzPyRvW/view?usp=sharing

---
