# To build:
# docker build -t interactivelabs/process-admin -f Dockerfile .
# docker push interactivelabs/process-admin:v1
#
# To run:
# run docker mongo....
# docker run -p 27017:27017 --name mongo-admin -d mongo
# docker run -p 9000:9000 --link mongo-admin:mongo -it interactivelabs/process-admin
# docker run -p 9000:9000 --link mongo-admin:mongo -it --entrypoint bash interactivelabs/process-admin

# docker run -p 9000:9000-it process-admin:v1
# docker run -p 9000:9000 -it --entrypoint bash process-admin:v1
FROM node:6.9.1
MAINTAINER Cesar Gonzalez, cesareg.borjon@gmail.com

RUN apt-get update && apt-get install -y ruby ruby-compass && \
            apt-get clean && \
            rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Global NPM installs
RUN npm install --silent -g grunt-cli bower

RUN mkdir app
COPY package.json app/package.json
WORKDIR app
RUN npm install

#Current workingdir is app from dependencies image.
WORKDIR /app
ADD bower.json /app
ADD .bowerrc /app

RUN bower install --allow-root
ADD . /app

RUN grunt build --force
WORKDIR /app/dist

# Define default command.
ENTRYPOINT ["npm", "start"]

# Expose ports.
EXPOSE 9000
