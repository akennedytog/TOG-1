## Description: <br>
Control Sonos speakers for discovery, status, playback, volume, grouping, favorites, queue operations, and optional Spotify search. <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[maddydci45-svg](https://clawhub.ai/user/maddydci45-svg) <br>

### License/Terms of Use: <br>


## Use Case: <br>
Developers and operators use this skill to let an agent work with Sonos speakers on a local network through the Sonos CLI. It supports common speaker-control workflows including discovery, status checks, playback, volume, grouping, favorites, queue operations, and optional Spotify search. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Agent-issued Sonos commands can change playback, volume, grouping, favorites, or queue state on local speakers. <br>
Mitigation: Review prompts and commands before allowing volume changes, grouping changes, queue clearing, playback, or Spotify-related actions. <br>
Risk: Installing the Sonos CLI from a moving Go module target may reduce reproducibility. <br>
Mitigation: Pin the Go module version when reproducible installs are required. <br>


## Reference(s): <br>
- [ClawHub Skill Page](https://clawhub.ai/maddydci45-svg/skills/sonos) <br>
- [Sonos CLI Homepage](https://sonoscli.sh) <br>
- [sonoscli Go Module](https://pkg.go.dev/github.com/steipete/sonoscli/cmd/sonos) <br>


## Skill Output: <br>
**Output Type(s):** [Text, Shell commands, Configuration guidance] <br>
**Output Format:** [Markdown with inline shell commands] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [Requires the sonos CLI binary; optional Spotify Web API credentials enable Spotify search.] <br>

## Skill Version(s): <br>
1.0.0 (source: server release metadata and artifact origin) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
