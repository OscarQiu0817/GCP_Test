# Use the official Node.js 18 image.
FROM node:alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy application code to the container image.
COPY . .

# Make port 3000 available to the world outside this container.
EXPOSE 3000

# Run the web service on container startup.
CMD ["npm", "start"]
