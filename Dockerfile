FROM node:18

# Install required dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  unixodbc-dev \
  build-essential

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Set Python for node-gyp
ENV PYTHON=python3

# Install Node dependencies
RUN npm install

# Start your app
CMD ["node", "app.js"]
