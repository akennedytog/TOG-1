# chatbot-deploy Skill

Description:
A skill to deploy and manage an AI-powered chatbot (Rasa) on a VPS via Tailscale.

Commands:

1. `chatbot-deploy init`  
   Scaffold a new Rasa chatbot project in the current directory.

2. `chatbot-deploy train [--domain DOMAIN_FILE] [--actions ACTIONS_FILE]`  
   Train the Rasa model with specified domain and action definitions.

3. `chatbot-deploy deploy [--env .env] [--host HOST_ALIAS]`  
   Deploy the trained model to the configured VPS over Tailscale.

4. `chatbot-deploy status [--host HOST_ALIAS]`  
   Check the running status and logs of the chatbot service.

Inputs:
- `.env` with RASA_TOKEN, VPS_HOST, TAILSCALE_AUTHKEY
- `domain.yml`, `data/nlu.yml`, `data/stories.yml`, `actions.py`

Outputs:
- Docker container running Rasa server on the VPS
- Webhook endpoint URL for integration

Examples:

  # Initialize a new bot
  > openclaw chatbot-deploy init

  # Train locally
  > openclaw chatbot-deploy train

  # Deploy to production
  > openclaw chatbot-deploy deploy --host my-vps

Dependencies:
- Rasa Open Source
- Docker
- Tailscale CLI
