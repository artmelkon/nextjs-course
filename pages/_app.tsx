import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { NotificationContextProvider } from "@/store/notification-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotificationContextProvider>
      <Layout>
        <Head>
          <title>Next Genereal Events Title</title>
          <meta name="description" content="" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Component {...pageProps} />
      </Layout>
    </NotificationContextProvider>
  );
}
