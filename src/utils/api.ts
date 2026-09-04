//const API_URL = "http://python.zelsd.rs:8088";
//const API_URL = "http://10.21.22.37:8088";
const API_URL = "http://10.21.57.57:8000"

export interface MbrResponse {
  maticni_broj: string;
  ime: string;
  prezime: string;
  puno_ime: string;
}

export async function getMbr(maticniBroj: string): Promise<MbrResponse> {
  const response = await fetch(`${API_URL}/api/mbr/${maticniBroj}`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch mbr: ${response.statusText}`);
  }

  const data: MbrResponse = await response.json();
  return data;
}

export interface Lokacija {
  id: number;
  vrednost: string;
  status_s: string;
}

export async function getLokacije(): Promise<Lokacija[]> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/lokacije/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lokacije: ${response.statusText}`);
  }

  const data: Lokacija[] = await response.json();
  return data;
}

export interface Zgrada {
  id: number;
  vrednost: string;
  status_s: string;
}

export async function getZgrade(lokacijaId: number): Promise<Zgrada[]> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/lokacije/${lokacijaId}/zgrade`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch zgrade: ${response.statusText}`);
  }

  const data: Zgrada[] = await response.json();
  return data;
}

export interface Vrata {
  id: number;
  vrednost: string;
  status_s: string;
}

export async function getVrata(lokacijaId: number): Promise<Vrata[]> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/lokacije/${lokacijaId}/vrata`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vrata: ${response.statusText}`);
  }

  const data: Vrata[] = await response.json();
  return data;
}

export interface AktivniKorisnik {
  id: number;
  mbr: string;
  id_card: string;
  status: string;
  vrata: number;
  is_mobile: boolean;
  clan: {
    MATICNI_BROJ: string;
    IME: string;
    PREZIME: string;
  };
}

export async function getAktivniKorisnici(): Promise<AktivniKorisnik[]> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/nfc/aktivni`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch aktivni korisnici: ${response.statusText}`
    );
  }

  const data: AktivniKorisnik[] = await response.json();
  return data;
}
export interface PostNfcBody {
  mbr: string;
  id_card: string;
  vrata: number;
}

export async function postNfc(body: PostNfcBody): Promise<AktivniKorisnik> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/nfc`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to post nfc: ${response.statusText}`);
  }

  const data: AktivniKorisnik = await response.json();
  return data;
}
export async function deactivateNfc(id: number): Promise<AktivniKorisnik> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/nfc/${id}/deaktiviraj`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to deactivate nfc: ${response.statusText}`);
  }

  const data: AktivniKorisnik = await response.json();
  return data;
}

export async function deactivateMobile(mobile_id: number): Promise<AktivniKorisnik> {
  const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
  const response = await fetch(`${API_URL}/api/mobile/${mobile_id}/deaktiviraj`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to deactivate mobile nfc: ${response.statusText}`);
  }
  const data: AktivniKorisnik = await response.json();
  return data;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  [key: string]: unknown;
}

export async function login(body: LoginBody): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const dataErr = await response.json();
    console.log(dataErr);
    return dataErr;
  }

  const data: LoginResponse = await response.json();
  if (data.accessToken) {
    localStorage.setItem("accessToken/kontrolapristupa", data.accessToken);
    localStorage.setItem(
      "ime/kontrolapristupa",
      data.firstName + " " + data.lastName
    );
    localStorage.setItem("adNalog/kontrolapristupa", String(data.username));
  }
  console.log(data);
  return data;
}

export async function logout() {
  localStorage.removeItem("accessToken/kontrolapristupa");
  localStorage.removeItem("ime/kontrolapristupa");
  localStorage.removeItem("adNalog/kontrolapristupa");
  window.location.href = "/kontrolapristupa/login";
}

type PendingUser = {
  id: number;
  ime: string;
  prezime: string;
  pogon?: string;
  sektor?: string;
  mbr?: string;
  id_android: string;
  status?: string;
  datum?: string;
};

export async function getZahteviZaPristup(): Promise<PendingUser[]> {
  try {
    const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
    const response = await fetch(`${API_URL}/api/mobile/nfc_mobile/requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch aktivni korisnici: ${response.statusText}`
      );
    }

    const data: PendingUser[] = await response.json();
    return data;
  } catch (error) {
    console.error("Greska pri fetchu zahteva za pristup:", error);
    throw new Error("Greska pri fetchu zahteva za pristup");
  }
}

export async function promeniStatus(nfc_id: number, status: string) {
  try {
    //const accessToken = localStorage.getItem("accessToken/kontrolapristupa");
    const response = await fetch(`${API_URL}/api/mobile/nfc_mobile/${nfc_id}/status`, {
      method: "PUT",
      headers: {
        //Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        status
      })
    });

    if (!response.ok) {
      throw new Error(
        `Failed to change status: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Greska pri promeni statusa zahtevu:", error);
    throw new Error("Greska pri promeni statusa zahtevu");
  }
}
