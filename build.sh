#!/bin/bash

#npm install --silent -g grunt-cli bower
#npm install -g grunt
#npm install

export SOD_SERVICES_USER=user
export SOD_SERVICES_PASSWORD=user
export SOD_INTERNAL_SERVICES_URL="http://127.0.0.1:8080/api"
export SOD_SERVICES_URL="http://127.0.0.1:8080/api"
export PORT=9000

if [ "${1}" = "build" ]
then
  npm install --silent -g grunt-cli bower
  npm install
  bower install --allow-root
  grunt build
  npm start
else
  grunt serve
fi



