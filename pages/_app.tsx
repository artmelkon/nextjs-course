import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPageContext } from "next";
import Layout from "../components/layout";
import { NotificationContextProvider } from "@/store/notification-context";
import { AuthContextProvider } from "@/store/auth-context";

type AppPropsWithAuth = AppProps & { initialLoggedIn: boolean };

export default function App({ Component, pageProps, initialLoggedIn }: AppPropsWithAuth) {
  return (
    <AuthContextProvider initialLoggedIn={initialLoggedIn}>
      <NotificationContextProvider>
        <Layout>
          <Head>
            <title>Next General Events</title>
            <meta name="description" content="" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          </Head>
          <Component {...pageProps} />
        </Layout>
      </NotificationContextProvider>
    </AuthContextProvider>
  );
}

App.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
  const cookies = ctx.req?.headers.cookie ?? '';
  const initialLoggedIn = cookies.includes('token=');
  return { initialLoggedIn };
};
