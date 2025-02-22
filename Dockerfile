    # Use the official Node.js image as the base image
    FROM node:16-alpine

    # Set the working directory in the container
    WORKDIR /app

    # Copy package.json and package-lock.json to the container
    COPY package*.json ./

    # Install dependencies
    RUN npm install --production

    # Copy the rest of the application code to the container
    COPY . .
    # Copy the .env file into the container
     COPY .env .env
    # Expose the port your backend runs on
    EXPOSE 3000

    # Define the command to run the application
    CMD ["npm", "run", "dev"]
