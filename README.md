# Blogify

Blogify is a feature-rich, responsive blog website developed using Node.js, Express.js, EJS, and MongoDB. It provides a user-friendly platform for creating, managing, and sharing engaging blog content.

## Key Features:

- **Admin Authentication:** Secure authentication system implemented for administrators to manage the website's content.

- **CRUD Operations:** Efficient CRUD operations integrated for content management, allowing users to create, read, update, and delete blog posts seamlessly.

## Technologies Used:

- **Node.js:** JavaScript runtime used for server-side development.
  
- **Express.js:** Web application framework utilized for building the backend server.
  
- **EJS:** Embedded JavaScript templating language employed for generating dynamic HTML content.
  
- **MongoDB:** NoSQL database utilized for storing blog posts, comments, and user data.

## Website Link:

[Blogify Website](https://myblogsite-sndp.onrender.com)

## Hosted Environment:

The website is hosted on Render. You can access it using the provided link.

## Usage:

1. Clone the repository.
  
   ```bash
   git clone https://github.com/your-username/Blogify.git
   
2. Install dependencies:

   ```bash
   cd Blogify
   npm install

3. Set up environment variables:
   
   Create a .env file in the root directory and add the following variables:

   ```bash
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   ```

   Replace your_mongodb_uri with your MongoDB connection string and your_session_secret with a secret key for session management.

4. Run the application:

   ```bash
   npm start
   
5. Access the website locally at http://localhost:3000.
