

# **RescueApp**

RescueApp is a mobile application built with **React Native** and **Expo**. It provides users with a variety of functionalities and features for efficient interaction with a backend API. The app supports multiple platforms, including Android, iOS, and the web.

---

## **Table of Contents**

1. [Installation](#installation)
2. [Available Scripts](#available-scripts)
3. [Features](#features)
4. [Dependencies](#dependencies)
5. [Usage](#usage)
6. [API Integration](#api-integration)
7. [Contributing](#contributing)
8. [License](#license)
9. [Troubleshooting](#troubleshooting)

---

## **Installation**

To get started with RescueApp on your local machine, follow these steps:

### **Prerequisites**

Make sure you have the following installed:

* **Node.js**: [Download Node.js](https://nodejs.org/)
* **Expo CLI**: You can install Expo CLI globally by running:

  ```bash
  npm install -g expo-cli
  ```

### **Cloning the Repository**

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/mustafaDevop/Rescue_federation_api.git
   cd Rescue_federation_api
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

---

## **Available Scripts**

Here are the available scripts for development:

### **Development**

* **Start the app in development mode** (for Android, iOS, or Web):

  ```bash
  npm start
  ```

* **Run the app on an Android device or emulator**:

  ```bash
  npm run android
  ```

* **Run the app on an iOS simulator or device**:

  ```bash
  npm run ios
  ```

* **Run the app on the web**:

  ```bash
  npm run web
  ```

### **Production**

To build the app for production (both Android and iOS), you can run:

```bash
expo build:android
expo build:ios
```

---

## **Features**

* **Authentication**: Users can log in, register, and log out.
* **Request Management**: Users can create requests and track their statuses.
* **Data Storage**: User preferences and settings are stored securely using Expo's Secure Store.
* **Notifications**: Users receive push notifications for status updates.
* **Maps**: The app integrates with React Native Maps for location-based services.

---

## **Dependencies**

This project uses the following dependencies:

### **Core Libraries**

* **React Native**: Core framework for building mobile apps.
* **Expo**: Provides a set of tools and services to help build React Native apps.
* **Axios**: For making HTTP requests to the backend API.

### **UI & Navigation**

* **@react-navigation**: For routing and navigation within the app.
* **@expo/vector-icons**: To add icons throughout the app.
* **react-native-gesture-handler**: For gesture handling and animations.
* **@gorhom/bottom-sheet**: For the Bottom Sheet UI component.

### **State Management & Async Storage**

* **@react-native-async-storage/async-storage**: For persistent storage of key-value pairs.
* **react-native-toast-notifications**: For displaying toast notifications.
* **expo-secure-store**: For secure storage of sensitive data.

### **Maps & Calendars**

* **react-native-maps**: For integrating maps into the app.
* **react-native-calendars**: To handle and display dates and calendars.

---

## **Usage**

### **Setting Up API Integration**

This app makes use of the backend API to fetch, submit, and manage requests. For example, to fetch user requests, the app communicates with the following API endpoint:

```js
import axios from 'axios';

const fetchUserRequests = async () => {
  try {
    const response = await axios.get('http://localhost:7227/api/requests', {
      headers: {
        Authorization: `Bearer ${yourAuthToken}`
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching requests:', error);
  }
};
```

### **Local Testing**

1. **Start the backend server** (if needed) on the appropriate port (e.g., `localhost:7227`).
2. Run the app in your local environment (iOS, Android, or Web).

---

## **Contributing**

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Clone your fork: `git clone <your-fork-url>`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes.
5. Commit and push: `git push origin feature/my-feature`
6. Open a pull request to the main repository.

---

## **License**

This project is licensed under the **MIT License**.

---

## **Troubleshooting**

Here are some common issues and their solutions:

### **Expo Not Starting**

* **Issue**: If the app doesn’t start when running `npm start` or `expo start`, try clearing the cache:

  ```bash
  expo start -c
  ```

### **Android Emulator Not Running**

* **Issue**: The Android emulator may not be running properly.
* **Solution**: Make sure you have Android Studio installed and your emulator is running.

### **iOS Simulator Issues**

* **Issue**: The iOS simulator might not launch.
* **Solution**: Ensure that Xcode and the iOS simulator are correctly set up.

---

This README should provide a solid foundation for understanding how to set up, run, and contribute to the RescueApp. As you expand the app’s features, you can add more specific sections like feature documentation, advanced usage, and additional setup configurations.
