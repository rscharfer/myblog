import { Montserrat, Lato } from "next/font/google";

const montserrat = Montserrat({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-montserrat" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });

export default function App({ Component, pageProps }) {
  return (
    <main className={`${montserrat.variable} ${lato.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
