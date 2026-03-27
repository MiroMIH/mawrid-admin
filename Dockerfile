FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Rename uppercase UI components to lowercase (Linux is case-sensitive, Windows is not).
# Then create uppercase symlinks so both import styles work.
RUN for f in /app/src/components/ui/*.tsx; do \
      dir=$(dirname "$f"); base=$(basename "$f"); \
      lower=$(echo "$base" | tr '[:upper:]' '[:lower:]'); \
      if [ "$base" != "$lower" ]; then \
        mv "$f" "$dir/$lower" && ln -sf "$dir/$lower" "$dir/$base"; \
      fi; \
    done
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
