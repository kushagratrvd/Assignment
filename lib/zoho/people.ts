const ZOHO_PEOPLE_BASE_URL = (process.env.ZOHO_PEOPLE_BASE_URL || "https://people.zoho.in").replace(/\/$/, "");

// Fetch records from Zoho People Bulk Records API
export async function fetchBulkEmployees(accessToken: string, sIndex = 1, limit = 200, baseUrl?: string) {
  const host = (baseUrl || ZOHO_PEOPLE_BASE_URL).replace(/\/$/, "");
  const url = `${host}/people/api/forms/employee/getRecords?sIndex=${sIndex}&limit=${limit}&rec_limit=${limit}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    cache: "no-store",
  });

  return await res.json();
}

// Fetch all employees in batches of up to 200 records
export async function fetchAllEmployees(accessToken: string, baseUrl?: string) {
  const all: Array<{ id: string; name: string; role: string; email: string }> = [];
  let sIndex = 1;
  const batchSize = 200;
  let rawResponse: any = null;

  while (true) {
    const data = await fetchBulkEmployees(accessToken, sIndex, batchSize, baseUrl);
    rawResponse = data;

    // Check for auth error
    if (data?.error === "invalid_token" || data?.response?.status === 7000) {
      return { users: [], rawResponse: data, isAuthError: true };
    }

    const records = normalizeZohoRecords(data);
    if (!records || records.length === 0) break;

    all.push(...records);

    // If fewer records were returned than batchSize, we have fetched all available records
    if (records.length < batchSize) break;
    sIndex += batchSize;

    if (sIndex > 5000) break; // Safety limit
  }

  return { users: all, rawResponse, isAuthError: false };
}

// Fetch total employee count from Zoho People
export async function getEmployeeCount(accessToken: string, baseUrl?: string): Promise<number | null> {
  try {
    const host = (baseUrl || ZOHO_PEOPLE_BASE_URL).replace(/\/$/, "");
    const url = `${host}/people/api/forms/employee/getRecordCount`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.response?.result;
    const rawCount = result?.RecordCount ?? result?.recordCount ?? result?.count ?? data?.RecordCount ?? data?.count;
    if (rawCount !== undefined && rawCount !== null) {
      const parsed = Number(rawCount);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.warn("Could not fetch employee record count:", err);
    return null;
  }
}

// Normalize the response into simple { id, name, role, email }
export function normalizeZohoRecords(data: any) {
  const list: Array<{ id: string; name: string; role: string; email: string }> = [];
  const results = data?.response?.result;

  if (!Array.isArray(results)) return list;

  for (const item of results) {
    if (!item) continue;

    // Zoho bulk records are typically nested under a record ID key
    const keys = Object.keys(item);
    let record = item;
    if (keys.length > 0 && Array.isArray(item[keys[0]])) {
      record = item[keys[0]][0] || {};
    }

    const name =
      [record.FirstName, record.LastName].filter(Boolean).join(" ") ||
      record["Employee Name"] ||
      record.name ||
      "N/A";

    const id = String(record.EmployeeID || record.Zoho_ID || "N/A");
    const role = String(record.Role || record.Designation || record["Role.ID"] || "N/A");
    const email = String(record.EmailID || record.email || "N/A");

    list.push({ id, name, role, email });
  }

  return list;
}
