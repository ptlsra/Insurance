FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

#RUN echo '172.20.17.242 \t btpproxy.mphasis.com' >> /etc/hosts ; export http_proxy=http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080 ; echo $http_proxy ;npm config set strict-ssl false;npm install;
RUN echo '172.20.17.242 \t btpproxy.mphasis.com' >> /etc/hosts ; export http_proxy=http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080 ; echo $http_proxy ;npm config set proxy http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080/ ;npm config set https-proxy http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080/ ;git config --global http.proxy http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080 ;npm config set strict-ssl false;npm config set registry https://registry.npmjs.org/ ;npm install;

#RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 7000
CMD [ "./initInsurance.sh" ]
