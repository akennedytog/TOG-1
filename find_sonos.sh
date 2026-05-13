#!/bin/bash
echo "🔍 Scanning for Sonos devices on 192.168.4.x..."
echo "This may take 30 seconds..."

for i in {1..254}; do
  (timeout 0.5 bash -c "echo > /dev/tcp/192.168.4.$i/1400" 2>/dev/null && echo "Found device: 192.168.4.$i"
) &
done
wait
echo ""
echo "Done! Copy the IPs above for each Sonos speaker."
