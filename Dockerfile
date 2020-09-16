FROM node:8-jessie

RUN mkdir -p /srv/app/pdf-gen-server
WORKDIR /srv/app/pdf-gen-server

COPY ./src/package.json /srv/app/pdf-gen-server
COPY ./src/package-lock.json /srv/app/pdf-gen-server
COPY ./src/ /srv/app/pdf-gen-server

# Build UI
WORKDIR src/userInterface/src
RUN echo "Install.."
RUN npm install 
RUN echo "Audit fix.."
RUN npm audit fix 
RUN echo "Build.."
RUN npm run build

#Copy build to server
WORKDIR ../../..
RUN echo 'Copying...' 
RUN ls
RUN cp -rT src/userInterface/build src/editor 
RUN echo "Installing.."
RUN npm install

# Compile Typescript
RUN npx tsc
RUN cp -r src/editor dist/src
RUN cp -r src/views dist/src
RUN cp -r src/templatingEngine/PDFMaker/fonts dist/src/templatingEngine/PDFMaker
RUN cat env/production.env > /srv/app/pdf-gen-server/.env

EXPOSE 80
CMD ["node", "dist/src/start.js"]

