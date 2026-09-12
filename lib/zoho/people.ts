const ZOHO_PEOPLE_BASE_URL = (process.env.ZOHO_PEOPLE_BASE_URL || "https://people.zoho.in").replace(/\/$/, "");

// Fetch records from Zoho People Bulk Records API
export async function fetchBulkEmployees(accessToken: string, sIndex = 1, limit = 200) {
  const url = `${ZOHO_PEOPLE_BASE_URL}/people/api/forms/employee/getRecords?sIndex=${sIndex}&limit=${limit}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    cache: "no-store",
  });

  return await res.json();
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
