# Dockerfile

# Use an official Node.js runtime as the base image
FROM node:latest
RUN wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.6.1.tar.gz
# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 for the application
EXPOSE 4000


# ---=== debug ====---
# RUN npm install && npm install tsx && npm run start
# CMD tail -f /dev/null

# Start the application
CMD [ "npm", "start" ]
