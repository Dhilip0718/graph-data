
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY packages/server/package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code to the working directory
COPY packages/server/ .

# Expose the port your app runs on
EXPOSE 3000


# Run the app
CMD [ "npm", "start" ]