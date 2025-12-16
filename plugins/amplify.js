import { Amplify } from "aws-amplify";
import { signIn, getCurrentUser } from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage, Hub } from "aws-amplify/utils";

async function ensureLoggedIn() {
  try {
    await getCurrentUser();
  } catch {
    await doLogin();
  }
}

async function doLogin() {
  const runtimeConfig = useRuntimeConfig();
  const DEFAULT_USER = {
    username: runtimeConfig.public.masterUserName,
    password: runtimeConfig.public.masterUserPW,
  };
  try {
    await signIn({
      username: DEFAULT_USER.username,
      password: DEFAULT_USER.password,
      options: {
        authFlowType: "USER_PASSWORD_AUTH",
      },
    });
  } catch (err) {
    console.error("Auto-login failed:", err);
  }
}

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: runtimeConfig.public.userPoolWebClientId,
        userPoolId: runtimeConfig.public.userPoolId,
      },
    },
  });

  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      domain: runtimeConfig.public.app_domain,
    })
  );

  // Listen for token refresh failures / sign out
  Hub.listen("auth", async ({ payload }) => {
    if (
      payload.event === "signedOut" ||
      payload.event === "tokenRefresh_failure"
    ) {
      await doLogin();
    }
  });

  // Auto-login on app load (client-side only)
  if (process.client) {
    await ensureLoggedIn();
  }
});
