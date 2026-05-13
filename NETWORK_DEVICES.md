# Network Device Inventory

*Scanned: March 23, 2026*

## Confirmed Devices

| IP | MAC | Device | Status | Dashboard |
|----|-----|--------|--------|-----------|
| 192.168.4.1 | fc:3f:a6:8f:5d:72 | **Eero Router** | ✅ Online | No (router mgmt) |
| 192.168.4.27 | f0:f6:c1:84:60:40 | **Sonos TV Room** | ✅ Online | ✅ Added |
| 192.168.4.28 | 34:7e:5c:c6:48:a6 | **Sonos Kitchen** | ✅ Online | ✅ Added |
| 192.168.4.206 | 94:9f:3e:d6:00:49 | **Sonos Living Room** | ✅ Online | ✅ Added |
| 192.168.4.127 | e8:aa:cb:86:93:46 | **Apple Device** | ✅ Online | ⏸️ Investigate |
| 192.168.4.134 | 8a:e0:9f:17:70:be | **Apple Device** | ✅ Online | ⏸️ Investigate |

## Unknown Devices (Need Investigation)

| IP | MAC | Possible Type | Action Needed |
|----|-----|---------------|-------------|
| 192.168.4.23 | c0:d2:f3:63:0e:00 | Ring/Yale/Smart Hub | Check if Ring or Yale bridge |
| 192.168.4.61 | 1c:d6:be:e0:1a:2b | Unknown | Port scan needed |
| 192.168.4.210 | 1a:b1:95:0e:cc:93 | Unknown | Port scan needed |
| 192.168.4.223 | 66:89:61:6d:73:9c | Unknown | Port scan needed |
| 192.168.4.224 | 88:57:21:51:a3:98 | Unknown | Port scan needed |

## Dashboard Status

### ✅ Active (3 devices)
- **Sonos Living Room** - Play/Pause/Volume working
- **Sonos Kitchen** - Play/Pause/Volume working
- **Sonos TV Room** - Play/Pause/Volume working

### ⏸️ Pending Setup
- **Ring** - Credentials set, need 2FA completion
- **Yale Lock** - App connection issues, needs troubleshooting

### 🔍 To Investigate
- **Apple Devices** (2) - Check if Apple TV/HomePod for dashboard
- **5 Unknown devices** - Run port scanner to identify

## Next Steps

1. **Test Sonos controls** - Open HOME_DASHBOARD.html, click Play
2. **Identify Apple devices** - Are any Apple TVs or HomePods?
3. **Ring setup** - Complete 2FA authentication
4. **Yale troubleshoot** - Check Z-Wave hub or Yale Access app
5. **Scan unknowns** - Run `./scan-devices.sh` to identify remaining devices

## Commands to Identify More Devices

```bash
# Check what services are running on unknown IPs
curl http://192.168.4.23  # Web interface?
curl https://192.168.4.23 # Ring web?

# Check Apple devices
arp 192.168.4.127
arp 192.168.4.134
```
