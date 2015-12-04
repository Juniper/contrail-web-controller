# We will use the grunt binary from the node_modules locally installed.

GRUNT_DIR=./node_modules/grunt-cli
if [ -d "$GRUNT_DIR" ]; then
    ./node_modules/grunt-cli/bin/grunt --gruntfile webroot/test/ui/Gruntfile.js run
else
    echo "Run make dev-env and make test-env from contrail-web-core directory with respective 'REPO=' arg set."
fi
