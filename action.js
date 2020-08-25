// Running as a github action
process.env.APP_NAME = 'github-actions'

// Set mergeable yml config to config_file input from Actions workflow if provided
if (process.env.INPUT_CONFIG_FILE) {
  process.env.CONFIG_PATH = process.env.INPUT_CONFIG_FILE
}

// Start Mergeable using the Probot Actions Adapter
const adapt = require('probot-actions-adapter')
const probot = require('./index') // Mergeable
adapt(probot)
