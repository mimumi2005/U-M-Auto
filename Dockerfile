FROM node:18

# Install build tools and dependencies for native modules
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  unixodbc-dev \
  build-essential

# Set working directory
WORKDIR /app

# Copy all files (src/, package.json, etc.)
COPY . .

# Set Python for node-gyp
ENV PYTHON=python3

# Install dependencies
RUN npm install

# Run the app inside the /app/src directory
CMD ["sh", "-c", "npm run setup && npm run start"]
