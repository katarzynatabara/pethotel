const firebaseConfig ={
  apiKey: "AIzaSyCrkGXvcYVanX7pKgZROwjYg1cwXTdEaLs",
  authDomain: "pet-hotel-prod-bf930.firebaseapp.com",
  databaseURL: "https://pet-hotel-prod-bf930.firebaseio.com",
  projectId: "pet-hotel-prod-bf930",
  storageBucket: "pet-hotel-prod-bf930.appspot.com",
  messagingSenderId: "887929759226",
  appId: "1:887929759226:web:e93356642b7f37cbedb043",
  measurementId: "G-RMQGSCTJ70"
};

// Cloud Functions
// const backendUrl = `http://localhost:5000/${
//   firebaseConfig.projectId
// }/us-central1/api/api`;

// App Engine / Debug
const backendUrl = `http://localhost:8080/api`;

export default {
  firebaseConfig,
  backendUrl,
};
