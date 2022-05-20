# base Node.js image
FROM node:16-alpine

# environment variables
ENV NODE_ENV=production
ENV NODE_PORT=8000
ENV HOME=/home/node/app
ENV PATH=${PATH}:${HOME}/node_modules/.bin

# create application folder and assign rights to the node user
RUN mkdir -p $HOME && chown -R node:node $HOME

# set the working directory
WORKDIR $HOME

# set the active user
USER node

# copy package.json from the host
COPY --chown=node:node package*.json $HOME/

# install application modules
RUN npm install

# copy remaining files
COPY --chown=node:node . .

# expose port on the host
EXPOSE $NODE_PORT

# application launch command
CMD [ "node", "./index.js" ]
