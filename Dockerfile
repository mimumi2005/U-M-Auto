FROM node:18

# Install build tools and dependencies for msnodesqlv8
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  unixodbc-dev \
  build-essential

# Set working directory
WORKDIR /app

# Copy all files to the container
COPY . .

# Set Python for node-gyp
RUN npm config set python python3

# Install Node.js dependencies
RUN npm install

# Start your app directly with Node.js
CMD ["node", "app.js"]
