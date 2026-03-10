# agent-skill-template Skill

Description:
A template for building domain-specific Agent Skills powered by OpenClaw. Scaffold and package custom agents for distribution.

Commands:

1. `agent-skill-template init [--name NAME]`  
   Generate a new agent skill directory with boilerplate code and metadata.

2. `agent-skill-template build [--mode MODE]`  
   Bundle the skill for deployment or sharing (npm package, GitHub repo).

3. `agent-skill-template test [--cases FILE]`  
   Run sample dialogues or integration tests defined in a JSON file.

Inputs:
- Metadata file `skill.json` (name, description, version, author)
- `index.js` or equivalent entrypoint implementing `onMessage` / `onInvoke`
- Optional `README.md` and example scripts

Outputs:
- Packaged skill ready for publication (tarball, npm)
- Test report and logs

Examples:

  # Scaffold a new skill
  > openclaw agent-skill-template init --name real-estate-qualifier

  # Build for npm
  > openclaw agent-skill-template build --mode npm

  # Run test dialogue
  > openclaw agent-skill-template test --cases tests/cases.json

Dependencies:
- Node.js
- OpenClaw SDK
