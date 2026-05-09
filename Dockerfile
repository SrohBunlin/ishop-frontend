# ដំណាក់កាលទី ១: Build កូដ React ឱ្យទៅជា Static Files
FROM node:18-alpine AS build-stage

# បង្កើត Folder ក្នុង Container
WORKDIR /app

# ចម្លងហ្វាយ package.json ដើម្បី install dependencies
COPY package*.json ./
RUN npm install

# ចម្លងកូដទាំងអស់ (src, public, ល) ចូលទៅក្នុង Container
COPY . .
ENV GENERATE_SOURCEMAP=false
# Build កូដសម្រាប់ប្រើប្រាស់ពិត (Production)
RUN npm run build

# ដំណាក់កាលទី ២: យក Static Files ទៅរត់លើ Nginx
FROM nginx:stable-alpine

# ចម្លងយកតែ Folder 'build' ដែលបានមកពីដំណាក់កាលទី ១
COPY --from=build-stage /app/build /usr/share/nginx/html

# បើក Port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]