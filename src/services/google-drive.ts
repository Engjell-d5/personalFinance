const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const SYNC_FILENAME = "personalfinance-sync.enc";

async function driveRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Drive API error ${res.status}: ${body}`);
  }

  return res;
}

export async function findSyncFile(
  token: string
): Promise<string | null> {
  const query = encodeURIComponent(
    `name='${SYNC_FILENAME}' and trashed=false`
  );
  const res = await driveRequest(
    `${DRIVE_API}/files?q=${query}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`,
    token
  );
  const data = await res.json();
  const files = data.files as { id: string }[];
  return files.length > 0 ? files[0]!.id : null;
}

export async function downloadFile(
  token: string,
  fileId: string
): Promise<string> {
  const res = await driveRequest(
    `${DRIVE_API}/files/${fileId}?alt=media`,
    token
  );
  return res.text();
}

export async function uploadNewFile(
  token: string,
  content: string
): Promise<string> {
  const metadata = {
    name: SYNC_FILENAME,
    parents: ["appDataFolder"],
  };

  const boundary = "---sync-boundary-" + Date.now();
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const res = await driveRequest(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id`,
    token,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  const data = await res.json();
  return data.id;
}

export async function updateFile(
  token: string,
  fileId: string,
  content: string
): Promise<void> {
  await driveRequest(
    `${UPLOAD_API}/files/${fileId}?uploadType=media`,
    token,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: content,
    }
  );
}
