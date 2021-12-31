import Head from 'next/head'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="">
      <Head>
        <title>Robify</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

     <main>
       <Sidebar />
       {/* Center */}
     </main>

     <div>{/* Music Player*/}</div>
    </div>
  )
}
