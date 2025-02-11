import Cookies from "js-cookie";
import { backPort } from "@/shared/const/back";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";

export async function attemptRefresh(): Promise<boolean> {
  try {
    const storedRefresh = Cookies.get(rToken);
    if (!storedRefresh) {
      return false;
    }

    const mutation = `
      mutation Refresh($refreshToken: String!) {
        refresh(refreshToken: $refreshToken) {
          user {
            id
            firstName
            lastName
            email
            roles
          }
          accessToken
          refreshToken
        }
      }
    `;

    const response = await fetch(backPort, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: mutation,
        variables: { refreshToken: storedRefresh },
      }),
    });

    if (!response.ok) {
      return false;
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      return false;
    }

    const data = json.data.refresh;
    localStorage.setItem(aToken, data.accessToken);
    Cookies.set(rToken, data.refreshToken, {
      secure: true,
      sameSite: "strict",
      expires: 7,
    });
    return true;
  } catch {
    return false;
  }
}
