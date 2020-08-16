// Set config to config_file input value from Actions if provided
if (process.env.INPUT_CONFIG_FILE) {
  process.env.CONFIG_PATH = process.env.INPUT_CONFIG_FILE	
}

// Start Mergeable using the Probot Actions Adapter
const adapt = require('probot-actions-adapter')
const probot = require('./index') // Mergeable
adapt(probot)
