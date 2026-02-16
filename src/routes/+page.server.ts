import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import https from 'https';
import http from 'http';

export const prerender = false;

// Agents for HTTP and HTTPS requests
// For HTTPS: disable TLS verification in dev when `SKIP_TLS_VERIFY=1` is set (useful for self-signed certs)
// For HTTP: no agent needed (HTTP is unencrypted)
const httpsAgent = env.SKIP_TLS_VERIFY === '1' ? new https.Agent({ rejectUnauthorized: false }) : undefined;
const httpAgent = new http.Agent();

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    // Extract form data
    const vmid = data.get('vmid');
    const name = data.get('name');
    const memory = data.get('memory');
    const cores = data.get('cores');
    const storage = data.get('storage'); // e.g., local-lvm
    const diskSize = data.get('diskSize'); // GB size
    const iso = data.get('iso'); // ex. local:iso/ubuntu.iso

    // Basic Validation
    if (!vmid || !name || !memory || !cores) {
      return fail(400, { missing: true, message: 'Missing required fields' });
    }

    try {
      // 1. Construct the Proxmox API URL
      const node = env.PROXMOX_NODE;
      const protocol = env.PROXMOX_HOST?.startsWith('http') ? '' : 'https://';
      const host = env.PROXMOX_HOST?.replace(/^https?:\/\//, ''); // Strip protocol if present
      const url = `${protocol}${host}:${env.PROXMOX_PORT}/api2/json/nodes/${node}/qemu/`;

      // 2. Prepare Auth Header
      const token = `PVEAPIToken=${env.PROXMOX_USER}!${env.PROXMOX_TOKEN_ID}=${env.PROXMOX_TOKEN_SECRET}`;

      // 3. Prepare Payload
      // Note: This is a minimal config. Proxmox accepts many more options.
      const payload = {
        vmid: vmid,
        name: name,
        memory: memory, // MB
        cores: cores,
        sockets: 1,
        net0: 'virtio,bridge=vmbr0', // Default bridge
        ostype: 'l26', // Linux 2.6+
        scsi0: `${storage}:${diskSize}`, // e.g., local-lvm:32
        ide2: `${iso},media=cdrom` // ISO mount
      };

      // Convert payload to URLSearchParams (Proxmox API expects x-www-form-urlencoded or json)
      // fetch's 'body' with JSON works, but Proxmox strictly often prefers form data structure for some endpoints.
      // Using JSON here, if it fails, switch to URLSearchParams.
      
      // Use native http/https.request so we can pass the correct agent.
      // Supports both HTTP (local dev) and HTTPS (with optional TLS verification bypass).
      const bodyString = JSON.stringify(payload);
      const isHttps = url.startsWith('https');
      const requestModule = isHttps ? https : http;
      const agent = isHttps ? httpsAgent : httpAgent;

      const requestResult = await new Promise<{ status: number; data: any }>((resolve, reject) => {
        const req = requestModule.request(url, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyString).toString()
          },
          agent
        }, (res) => {
          let raw = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            try {
              let parsed = null;
              // Only parse as JSON if content is not empty and looks like JSON
              if (raw && (raw.startsWith('{') || raw.startsWith('['))) {
                parsed = JSON.parse(raw);
              }
              resolve({ status: res.statusCode || 500, data: parsed, raw });
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.write(bodyString);
        req.end();
      });

      console.log('Proxmox API Response:', { status: requestResult.status, body: requestResult.raw?.substring(0, 200) });

      const responseStatus = requestResult.status;
      const result = requestResult.data;

      // Handle redirects
      if (responseStatus >= 300 && responseStatus < 400) {
        console.error('Proxmox Redirect:', requestResult.raw);
        return fail(responseStatus, {
          error: true,
          message: `Proxmox returned redirect (${responseStatus}). Check API endpoint URL and credentials.`
        });
      }

      if (responseStatus < 200 || responseStatus >= 300) {
        console.error('Proxmox Error:', result || requestResult.raw);
        return fail(responseStatus, {
          error: true,
          message: (result && (result.errors ? JSON.stringify(result.errors) : result.data)) || requestResult.raw || 'Failed to create VM'
        });
      }

      // Success returns a UPID (Task ID)
      return { success: true, taskId: result.data };

    } catch (err: any) {
      console.error('Server Error:', err);
      return fail(500, { error: true, message: err.message });
    }
  }
};