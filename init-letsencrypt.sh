#!/bin/bash

# Default values
rsa_key_size=4096
data_path="./certbot"

# Usage function
usage() {
    echo "Usage: $0 -e email -d domain1 -d domain2 ..."
    exit 1
}

# Parse command-line options
while getopts "e:d:" opt; do
    case "$opt" in
        e) email="$OPTARG" ;;
        d) domains+=("$OPTARG") ;;
        *) usage ;;
    esac
done

# Validate input
if [ -z "$email" ] || [ "${#domains[@]}" -eq 0 ]; then
    usage
fi

# Stop containers to avoid conflicts
docker-compose down

# Delete dummy certificates if they exist
rm -rf ${data_path}/conf/live

# Create directories for certificates
mkdir -p ${data_path}/conf/live

# Create temporary nginx config that doesn't depend on certificates
cat > ./nginx/conf.d/temp.conf << EOF
server {
    listen 80;
    server_name ${domains[*]};

    location / {
        return 200 'Temporary configuration for SSL setup';
    }
}
EOF

# Start nginx with temporary config
docker-compose up -d nginx

# Request certificates manually
echo "Requesting Let's Encrypt certificates..."
echo "You'll need to add DNS TXT records as prompted"

for domain in "${domains[@]}"; do
    docker-compose run --rm --entrypoint "\
    certbot certonly --manual --preferred-challenges dns \
    --email $email \
    --server https://acme-v02.api.letsencrypt.org/directory \
    --agree-tos \
    -d $domain" certbot
done

# Restore original nginx configuration
rm ./nginx/conf.d/temp.conf
docker-compose restart nginx

echo "Done! Certificates should now be issued."
