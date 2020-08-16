FROM node:14.4.0-alpine
ENV NODE_ENV=production \
	IS_GITHUB_ACTION=true
WORKDIR /app
COPY . .
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --no-optional --only=production

ENTRYPOINT [ "node", "/app/action.js" ]
